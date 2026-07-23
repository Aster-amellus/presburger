# 第 12 章：二维 stencil 的端到端推导

## 直觉

前十一章分别建立了公式、集合、关系、依赖、调度、变换与扫描。本章把它们串成一条可回溯链：每一步只消费前一步已经证明的对象，直到生成代码；若某一步使用近似或额外前提，后面的结论也只能在同一边界内成立。

贯穿程序是一个时间—空间 stencil：

```c
for (int t = 1; t <= T; ++t)
  for (int i = 1; i < N - 1; ++i)
    S: A[t][i] = A[t - 1][i - 1]
                 + A[t - 1][i]
                 + A[t - 1][i + 1];
```

完整调用链分为九个阶段：

| 阶段 | 输入 | 输出或检查 |
|---:|---|---|
| 1 | C 源程序与语言前提 | SCoP、顺序执行语义、完整二维数组模型 |
| 2 | 循环边界与参数 | 参数上下文和整数迭代域 |
| 3 | 赋值语句 | 三条读访问、一个写访问及精确 live-in |
| 4 | 域、访问、原始顺序 | 三支精确 RAW，方向恒为 source → sink |
| 5 | RAW 与原调度 | identity 合法性和逐时间层并行事实 |
| 6 | 矩形 tiling 目标 | skew 坐标及其非负依赖距离 |
| 7 | skew 域与固定 tile 大小 | 矩形 tile、tile wavefront 和并行边界 |
| 8 | 合法调度图 | 精确 `min/max` 边界、AST 形状与伪 C |
| 9 | 生成迭代和工具对象 | 不漏不重、依赖保序及 isl/Omega 表示边界 |

一个重要结论会贯穿后半章：原 identity 调度已经合法，skew **不是**程序正确性的必要条件。本章选择 skew，是为了让所选的轴对齐矩形 tile 具有易证明的非负 tile 依赖，并进一步形成 tile 级 wavefront。

## 形式定义

### 阶段 1：程序、内存与语言前提

令参数向量为 \(p=(T,N)\)，参数上下文为

\[
C(p):T\ge1\land N\ge3.
\]

本章的正确性结论还依赖下列显式前提。

1. `A` 是完整二维存储，至少覆盖 \(A[u,v]\) 的 \(0\le u\le T\)、\(0\le v<N\)。不同坐标表示不同抽象内存位置，也不存在破坏这一模型的指针别名。
2. 原程序按 \((t,i)\) 严格词典序执行；每个实例先完成右侧三个读，再写 \(A[t,i]\)。三个只读 site 之间无需人为规定顺序。
3. 本章只重排不同语句实例，不改变单个 `S` 的表达式、括号、数值类型或异常行为。索引、tile 乘积和边界算术还须在目标整数类型中不溢出；伪 C 用数学整数解释这些控制表达式。
4. 数组不是 `volatile`，语句体没有隐藏 I/O、原子操作、同步或其他未建模副作用。

这里不能把 `A` 静默替换成两行滚动缓冲。滚动缓冲让不同逻辑时间行复用物理地址，会引入新的 WAR/WAW 以及可能不同的 RAW；必须对新访问关系重新分析。

### 阶段 2–3：参数域、读写关系与 live-in

唯一静态语句 `S` 的命名实例域为

\[
D_S(p)=\{[t,i]_S\in\mathbb Z^2
\mid1\le t\le T\land1\le i\le N-2\}.
\]

参数 \((T,N)\) 受 \(C(p)\) 约束，但不是实例 tuple 的坐标。令 \(M_A\) 为数组 `A` 的抽象内存空间，三个读访问和一个写访问均按 instance → memory 定向：

\[
\begin{aligned}
R_{-1}&=\{[t,i]_S\to A[u,v]\mid[t,i]_S\in D_S
              \land u=t-1\land v=i-1\}:D_S\to M_A,\\
R_0&=\{[t,i]_S\to A[u,v]\mid[t,i]_S\in D_S
              \land u=t-1\land v=i\}:D_S\to M_A,\\
R_{+1}&=\{[t,i]_S\to A[u,v]\mid[t,i]_S\in D_S
              \land u=t-1\land v=i+1\}:D_S\to M_A,\\
W&=\{[t,i]_S\to A[u,v]\mid[t,i]_S\in D_S
              \land u=t\land v=i\}:D_S\to M_A.
\end{aligned}
\]

下标 \((-1,0,+1)\) 是相对于 **sink 实例空间坐标 \(i\)** 的读取偏移，不是 source-to-sink 距离；转为 source 坐标后，空间距离的符号会反转。

域内写只覆盖 \(1\le u\le T,\ 1\le v\le N-2\)。没有域内 producer 的读所需的 live-in 内存位置，去重后恰为

\[
L_{in}
=\{A[0,v]\mid0\le v\le N-1\}
\cup
\{A[u,0],A[u,N-1]\mid1\le u\le T-1\}.
\]

当 \(T=1\) 时第二项为空。尤其不能只初始化第 0 行：当 \(T>1\) 时，时间行 \(1,\ldots,T-1\) 的左右边界也会被后继时间层读取。\(A[T,0]\) 和 \(A[T,N-1]\) 不被本程序读取，因而不属于本次计算的 live-in。

### 阶段 4：从同址候选到精确 RAW

对任一读 site \(R_\delta\)，先沿 source 写实例 → 内存 → sink 读实例构造

\[
\operatorname{Same}_\delta
=R_\delta^{-1}\circ W:D_S\to D_S.
\]

在 isl 的方向中，这对应 `W.apply_range(R_delta.reverse())`。随后与原始顺序相交，并对每个 sink 读选择此前最后写。本例中每个域内地址 \(A[t,i]\) 恰写一次，所以通过同址和原始顺序过滤的域内写就是唯一 last writer；没有中间同址写需要删除。精确 RAW 因而有三支：

\[
\begin{aligned}
\Delta_{-1}
&=\{[\tau,j]_S\to[\tau+1,j+1]_S
\mid1\le\tau\le T-1\land1\le j\le N-3\},\\
\Delta_0
&=\{[\tau,j]_S\to[\tau+1,j]_S
\mid1\le\tau\le T-1\land1\le j\le N-2\},\\
\Delta_{+1}
&=\{[\tau,j]_S\to[\tau+1,j-1]_S
\mid1\le\tau\le T-1\land2\le j\le N-2\}.
\end{aligned}
\]

每个有序对的第一元都是 producer/source，第二元都是 consumer/sink。以 sink 坐标重写时，它们分别是

\[
\begin{aligned}
[t-1,i-1]_S&\to[t,i]_S
&&\text{其中 }2\le t\le T, 2\le i\le N-2,\\
[t-1,i]_S&\to[t,i]_S
&&\text{其中 }2\le t\le T, 1\le i\le N-2,\\
[t-1,i+1]_S&\to[t,i]_S
&&\text{其中 }2\le t\le T, 1\le i\le N-3.
\end{aligned}
\]

第一时间层和两侧缺失的 producer 正好由 \(L_{\mathrm{in}}\) 解释。本模型中每个内部位置只写一次，故没有域内 WAW；所有对这些位置的读都在其写之后，故没有另加的跨实例 WAR。本章后续合法性输入就是

\[
\Delta_{RAW}=\Delta_{-1}\cup\Delta_0\cup\Delta_{+1}.
\]

最后写语义的经典来源是 Feautrier 的 [*Dataflow Analysis of Array and Scalar References*](https://doi.org/10.1007/BF01407931)；此处“唯一写使候选直接成为精确 RAW”是针对当前访问关系的推导，不是一般程序的捷径。整数同址和判空可参考 Pugh 的 [Omega Test](https://doi.org/10.1145/125826.125848)。

### 阶段 5–6：原调度与 skew 调度

原调度为

\[
\Theta_{id}(t,i)=(t,i).
\]

调度差始终按 sink 减 source 计算。三支 RAW 的 identity 距离依次是

\[
(1,1),\qquad(1,0),\qquad(1,-1).
\]

三者第一个非零分量都是 \(+1\)，故全都严格词典序向前。特别地，\((1,-1)\) 合法；词典序不要求每一维都非负。外层 \(t\) 已严格承载所有依赖，所以保持时间层顺序并在每层结束后同步时，同一固定 \(t\) 的不同 \(i\) 没有彼此依赖，可以并行。

为了构造本章选择的矩形 tiling，定义 skew 坐标

\[
x=t,\qquad y=t+i,\qquad
\Theta_{sk}(t,i)=(x,y)=(t,t+i).
\]

三支距离变为

\[
(1,2),\qquad(1,1),\qquad(1,0).
\]

它们逐分量非负，并且第一分量严格为正。这一更强性质使 \((x,y)\) 可作为本例的可置换 band，并让每个点依赖经过 floor 分块后具有非减 tile 坐标。skew 的目的正是服务这一 tile 形状与 wavefront 组织；identity 本身已经合法。

### 阶段 7：矩形 tile 与 tile wavefront

在 skew 坐标中，原域等价于斜带

\[
1\le x\le T,
\qquad
x+1\le y\le x+N-2.
\]

令 \(B_x\ge1,\ B_y\ge1\) 是**编译期固定**的正整数 tile 大小。定义 Euclidean 商余坐标

\[
\begin{aligned}
q_x&=\left\lfloor\frac{x-1}{B_x}\right\rfloor,
&r_x&=(x-1)-B_x q_x,&0\le r_x<B_x,\\
q_y&=\left\lfloor\frac{y-2}{B_y}\right\rfloor,
&r_y&=(y-2)-B_yq_y,&0\le r_y<B_y.
\end{aligned}
\]

以偏移 \(x-1\) 和 \(y-2\) 为 tile 原点，使所有有效 tile 编号非负。定义 tile wavefront

\[
w=q_x+q_y
\]

及完整调度

\[
\boxed{
\Theta_{\mathrm{wave}}(t,i)=(w,q_x,r_x,r_y).
}
\]

合法性分两种情形证明。skew 后每条点依赖都有 \(\Delta x=1\)、\(\Delta y\in\{0,1,2\}\)。floor 对非减整数输入单调，因此

\[
\Delta q_x\ge0,
\qquad
\Delta q_y\ge0.
\]

- 若依赖跨 tile，至少一个 tile 坐标严格增加，所以
  \(\Delta w=\Delta q_x+\Delta q_y\ge1\)，由第一维严格承载。
- 若依赖留在同一 tile，则 \(\Delta w=\Delta q_x=0\)，且 \(x\) 增加 1 而没有跨越 \(q_x\) 边界，所以 \(\Delta r_x=1\)，由第三维严格承载。

于是每条 source → sink RAW 在 \(\Theta_{\mathrm{wave}}\) 下都严格向前。进一步，固定同一 \(w\) 的两个**不同 tile** 不可能存在依赖：若有依赖，\((q_x,q_y)\) 均非减；它们的和又不变，只能推出两坐标都不变，即其实是同一个 tile，矛盾。因此可以并行的是“同一 wavefront 上的不同 tile”，不是同一 wavefront 内任意点，也不是 tile 内的 \(t\) 或 \(y\) 循环。不同 \(w\) 之间仍有 RAW，必须在波次之间完成同步。

矩形 tiling 和 wavefront 调度仍属于合法调度的选择，不能推出必然加速。收益取决于 tile 大小、缓存复用、并行粒度、负载均衡与屏障开销。仿射调度与变换的经典路线见 Feautrier [Part I](https://doi.org/10.1007/BF01407835) 和 [Part II](https://doi.org/10.1007/BF01379404)；本节的固定候选已直接逐支验证，无需把性能目标冒充合法性证明。

## 手算示例

### \(T=3,N=6\)：十二个实例与二十条 RAW 全枚举

此时每个时间层的空间坐标都是 \(i=1,2,3,4\)，所以域恰有 12 个实例：

\[
D_S(3,6)=\{(t,i)\mid t\in\{1,2,3\}, i\in\{1,2,3,4\}\}.
\]

三支 source → sink 依赖完整列为：

| 读 site | \(t=1\to2\) | \(t=2\to3\) | 数量 |
|---|---|---|---:|
| `i-1` | `(1,1)->(2,2)`, `(1,2)->(2,3)`, `(1,3)->(2,4)` | `(2,1)->(3,2)`, `(2,2)->(3,3)`, `(2,3)->(3,4)` | 6 |
| `i` | `(1,1)->(2,1)`, `(1,2)->(2,2)`, `(1,3)->(2,3)`, `(1,4)->(2,4)` | `(2,1)->(3,1)`, `(2,2)->(3,2)`, `(2,3)->(3,3)`, `(2,4)->(3,4)` | 8 |
| `i+1` | `(1,2)->(2,1)`, `(1,3)->(2,2)`, `(1,4)->(2,3)` | `(2,2)->(3,1)`, `(2,3)->(3,2)`, `(2,4)->(3,3)` | 6 |

合计 \(6+8+6=20\) 条，所有 source 的时间坐标都比 sink 小 1。该参数下 live-in 是第 0 行的六个位置，加上

\[
A[1,0],A[1,5],A[2,0],A[2,5],
\]

共 10 个不同位置。边界位置与 \(t=1\) 的读不会被错误接到一个不存在的域内 producer。

### 逐支代入 identity 与 skew

以 `i-1` 读支为例，source → sink 是

\[
(\tau,j)\to(\tau+1,j+1).
\]

identity 差为

\[
(\tau+1,j+1)-(\tau,j)=(1,1),
\]

skew 差为

\[
(\tau+1,\tau+1+j+1)-(\tau,\tau+j)=(1,2).
\]

同理，`i` 读支给 \((1,0)\mapsto(1,1)\)，`i+1` 读支给 \((1,-1)\mapsto(1,0)\)。这一步同时核对了常见符号错误：读取 `i-1` 对应的 source-to-sink 空间距离是 \(+1\)，读取 `i+1` 对应的是 \(-1\)。

### \(B_x=2,B_y=3\)：tile 分组与 wavefront

继续取 \(T=3,N=6\)。由

\[
q_x=\left\lfloor\frac{t-1}{2}\right\rfloor,
\qquad
q_y=\left\lfloor\frac{t+i-2}{3}\right\rfloor
\]

得到唯一分组：

| \((q_x,q_y)\) | \(w\) | 原坐标 \((t,i)\) | 点数 |
|---|---:|---|---:|
| \((0,0)\) | 0 | `(1,1)`, `(1,2)`, `(1,3)`, `(2,1)`, `(2,2)` | 5 |
| \((0,1)\) | 1 | `(1,4)`, `(2,3)`, `(2,4)` | 3 |
| \((1,0)\) | 1 | `(3,1)` | 1 |
| \((1,1)\) | 2 | `(3,2)`, `(3,3)`, `(3,4)` | 3 |

四组共 \(5+3+1+3=12\) 点，没有漏点或重复。\(w=1\) 上有两个不同 tile \((0,1)\) 与 \((1,0)\)；逐条检查前述 20 条 RAW，没有一条连接这两个 tile，因此它们可并行。tile \((0,0)\) 到 \(w=1\) 以及 \(w=1\) 到 tile \((1,1)\) 仍有依赖，所以 \(w=0,1,2\) 必须按序完成。

### 阶段 8：从斜域和 tile 交得到精确 `min/max`

全局 tile 上界是

\[
Q_x=\left\lfloor\frac{T-1}{B_x}\right\rfloor,
\qquad
Q_y=\left\lfloor\frac{T+N-4}{B_y}\right\rfloor.
\]

因此

\[
0\le w\le Q_x+Q_y.
\]

固定 \(w\) 后，合法 tile 坐标满足

\[
\max(0,w-Q_y)\le q_x\le\min(Q_x,w),
\qquad q_y=w-q_x.
\]

固定 \((q_x,q_y)\) 后，\(x=t\) 必须同时属于原时间域和 \(x\)-tile：

\[
t_{lo}=\max(1,1+B_x q_x),
\qquad
t_{hi}=\min(T,B_x(q_x+1)).
\]

再固定 \(t\)，\(y=t+i\) 必须同时属于斜域和 \(y\)-tile：

\[
y_{lo}=\max(t+1,2+B_yq_y),
\qquad
y_{hi}=\min(t+N-2,1+B_y(q_y+1)).
\]

只有 \(y_{lo}\le y_{hi}\) 时该 tile 在当前时间行有点；`for (y = y_lo; y <= y_hi; ++y)` 会自然跳过空区间。还原 \(i=y-t\) 后，第一组界给 \(i\ge1\)，第二组给 \(i\le N-2\)。四个 `max/min` 项分别来自原域与矩形 tile 的交，不是补丁：删掉任一项都会在斜带或边缘 tile 处漏点或越界。

扫描斜域到循环 AST 的经典路线可参阅 Quilleré、Rajopadhye 与 Wilde 的[多面体扫描工作](https://doi.org/10.1023/A:1007554627716)和 Bastoul 的[作者公开稿](https://icps.u-strasbg.fr/~bastoul/research/papers/Bas04-PACT.pdf)。本节公式是对当前域的直接消元；引用不替代下面的不漏不重证明。

### 阶段 8：生成后的教学性伪 C

下面代码按 \((w,q_x,x,y)\) 的等价词典序扫描实现 \(\Theta_{\mathrm{wave}}\)。在固定 tile 内，\((x,y)\) 与 \((r_x,r_y)\) 只相差由 tile 坐标确定的常量，所以顺序一致。

```c
// Preconditions:
//   T >= 1, N >= 3; Bx >= 1, By >= 1 are compile-time constants.
//   A is the full two-dimensional array described above; no harmful aliasing.
//   All index and boundary arithmetic below is representable without overflow.
// Live-ins:
//   A[0][0..N-1] and A[1..T-1][0], A[1..T-1][N-1].
int Qx = (T - 1) / Bx;          // numerator is nonnegative
int Qy = (T + N - 4) / By;      // numerator is nonnegative

for (int w = 0; w <= Qx + Qy; ++w) {
  int qx_lo = max(0, w - Qy);
  int qx_hi = min(Qx, w);

  // Only distinct tiles on this fixed wavefront have been proved independent.
  // The implicit end-of-loop barrier is required before advancing to w + 1.
  #pragma omp parallel for schedule(static)
  for (int qx = qx_lo; qx <= qx_hi; ++qx) {
    int qy = w - qx;
    int t_lo = max(1, 1 + qx * Bx);
    int t_hi = min(T, (qx + 1) * Bx);

    for (int t = t_lo; t <= t_hi; ++t) {
      int y_lo = max(t + 1, 2 + qy * By);
      int y_hi = min(t + N - 2, 1 + (qy + 1) * By);

      for (int y = y_lo; y <= y_hi; ++y) {
        int i = y - t;
        A[t][i] = A[t - 1][i - 1]
                    + A[t - 1][i]
                    + A[t - 1][i + 1];
      }
    }
  } // implicit OpenMP barrier: wavefront w is complete here
}
```

若不使用 OpenMP，删除 pragma 后代码仍按合法顺序串行执行。若使用 OpenMP，必须同时满足本章证明的完整二维 `A`、无有害别名、仅有三支 RAW、语句体无隐藏副作用等前提；不得添加 `nowait` 而又不提供等价屏障，也不得把 pragma 下移到 tile 内的 `t` 或 `y` 循环。平台还必须支持在当前上下文合法使用 OpenMP worksharing；这段代码只标出经依赖证明允许的位置，不声称完成线程数、调度策略和异常传播等工程配置。

### 阶段 9：点集双射与依赖保序

**生成点不会越出原域。** 代码中的 \(t\) 同时满足 \(1\le t\le T\) 和所属 \(x\)-tile 的区间；\(y\) 同时满足 \(t+1\le y\le t+N-2\) 和所属 \(y\)-tile 的区间。因此 \(i=y-t\) 满足 \(1\le i\le N-2\)，每次执行都对应 \(D_S\) 中的实例。

**原域点不会遗漏。** 任取 \((t,i)\in D_S\)，令 \(x=t,y=t+i\)。Euclidean 除法唯一给出

\[
q_x=\left\lfloor\frac{x-1}{B_x}\right\rfloor,
\qquad
q_y=\left\lfloor\frac{y-2}{B_y}\right\rfloor,
\qquad
w=q_x+q_y.
\]

这些值落入外层范围，而 \((t,y)\) 同时满足相应 tile 区间与斜域区间，所以循环一定生成该点。

**原域点不会重复。** Euclidean 商余使每个 \((x,y)\) 的 \((q_x,r_x,q_y,r_y)\) 唯一，\(w\) 又由 \((q_x,q_y)\) 唯一决定；每层单位步长循环也不重复取值。因此一个原实例只对应一次生成迭代。

**生成顺序保持依赖。** 对跨 tile RAW，wavefront 坐标严格增加；对 tile 内 RAW，\(r_x\) 严格增加。故每条 source → sink 都在 sink 执行前完成。OpenMP 只并行同一 \(w\) 的不同 tile，波次末屏障恢复跨 \(w\) 的先后。

四项合起来给出本例的语义链：生成迭代与原实例一一对应，实例实参 \(i=y-t\) 恢复正确，且所有精确 RAW 保序。由于语句体原样保留且没有其他可观察副作用，变换保持本模型内的值语义。若换成滚动缓冲、可能别名的指针或新增语句，这份证明的访问与依赖前提失效，必须重建模型。

### isl 可解析片段

下列每一段都是可交给相应 isl set/map 或 union set/map 读取接口的字符串；`S` 与 `A` 是 tuple 名。它们只描述数学对象，不是一个完整绑定程序。

```text
[T,N] -> { [] : T >= 1 and N >= 3 }

[T,N] -> { S[t,i] :
  T >= 1 and N >= 3 and 1 <= t <= T and 1 <= i <= N-2 }

[T,N] -> { S[t,i] -> A[t-1,i-1] :
  T >= 1 and N >= 3 and 1 <= t <= T and 1 <= i <= N-2 }
[T,N] -> { S[t,i] -> A[t-1,i] :
  T >= 1 and N >= 3 and 1 <= t <= T and 1 <= i <= N-2 }
[T,N] -> { S[t,i] -> A[t-1,i+1] :
  T >= 1 and N >= 3 and 1 <= t <= T and 1 <= i <= N-2 }
[T,N] -> { S[t,i] -> A[t,i] :
  T >= 1 and N >= 3 and 1 <= t <= T and 1 <= i <= N-2 }

[T,N] -> { S[t,i] -> [t,i] :
  T >= 1 and N >= 3 and 1 <= t <= T and 1 <= i <= N-2 }
[T,N] -> { S[t,i] -> [t,t+i] :
  T >= 1 and N >= 3 and 1 <= t <= T and 1 <= i <= N-2 }
```

三支已经求得的精确 RAW 可组成一个 union map：

```text
[T,N] -> {
  S[ts,is] -> S[ts+1,is+1] :
    T >= 1 and N >= 3 and 1 <= ts <= T-1 and 1 <= is <= N-3;
  S[ts,is] -> S[ts+1,is] :
    T >= 1 and N >= 3 and 1 <= ts <= T-1 and 1 <= is <= N-2;
  S[ts,is] -> S[ts+1,is-1] :
    T >= 1 and N >= 3 and 1 <= ts <= T-1 and 2 <= is <= N-2
}
```

这里的 transformed schedule 是可解析的 skew map；上述 RAW 是分析结果。仅把 domain、access 与 schedule 字符串放在一起，不会自动完成 last-write 选择，实际程序还要调用相应 flow/dependence API。对象和 API 语义以 [isl 官方手册](https://libisl.sourceforge.io/manual.pdf) 为准，不能由这些片段反推所有绑定具有相同命令行语法。

### Tiling 与 Omega 风格伪表示

下面第一段明确是**教学性 tiling 伪表示，不承诺可直接输入**：若 \((B_x,B_y)\) 是运行时符号参数，`Bx*qx`、`By*qy` 是变量乘变量，符号除数的 floor 也不是普通 Presburger 线性项。实际 isl tiling 应把 tile size 固定为字面正整数，或通过具体版本的 schedule-tree/band tiling API 构造。

```text
Skew: S[t,i] -> [x=t, y=t+i]
Tile: [x,y] -> [qx=floor((x-1)/Bx), qy=floor((y-2)/By),
                 rx=(x-1) mod Bx, ry=(y-2) mod By]
Wavefront:
  S[t,i] -> [floor((t-1)/Bx) + floor((t+i-2)/By),
             floor((t-1)/Bx),
             (t-1) mod Bx,
             (t+i-2) mod By]
```

下面第二段是**Omega 风格伪表示，不是已验证可运行脚本**。Omega Calculator 及后继/封装的方言、声明和对象接口并不完全统一，使用前必须适配目标工具；数组标签由关系变量名承担。

```text
symbolic T, N;
D := {[t,i] : T >= 1 && N >= 3 && 1 <= t && t <= T
                  && 1 <= i && i <= N-2};
Rminus := {[t,i] -> [u,v] : [t,i] in D && u = t-1 && v = i-1};
Rzero  := {[t,i] -> [u,v] : [t,i] in D && u = t-1 && v = i};
Rplus  := {[t,i] -> [u,v] : [t,i] in D && u = t-1 && v = i+1};
W      := {[t,i] -> [u,v] : [t,i] in D && u = t   && v = i};
Identity := {[t,i] -> [t,i] : [t,i] in D};
Skew     := {[t,i] -> [t,t+i] : [t,i] in D};

DeltaMinus := {[ts,is] -> [ts+1,is+1] : 1 <= ts && ts <= T-1
                                             && 1 <= is && is <= N-3};
DeltaZero  := {[ts,is] -> [ts+1,is]   : 1 <= ts && ts <= T-1
                                             && 1 <= is && is <= N-2};
DeltaPlus  := {[ts,is] -> [ts+1,is-1] : 1 <= ts && ts <= T-1
                                             && 2 <= is && is <= N-2};
```

## 编译器用途

1. **建立可审计流水线。** 前端提取参数上下文、域、访问和原始顺序；依赖分析得到精确 RAW；调度器只在这些边上选择合法候选；AST 生成器再扫描调度图。
2. **定位近似来源。** 若别名分析保守、访问非仿射或 flow 只取同址候选，后续调度和并行性也只能保守；生成出代码不会提高上游模型精度。
3. **分开合法性和收益。** identity 已合法且能逐时间层并行；skew/tiling 是为了不同的局部性与 tile 并行形状，是否更快必须测量。
4. **验证并行位置。** 本例唯一证明的 tile 级位置是固定 \(w\) 下的不同 tile；屏障、完整二维存储和无别名都是证明的一部分。
5. **审计 AST。** 除了查看循环边界，还要检查每个原实例恰生成一次、`i=y-t` 恢复正确、三支 source → sink RAW 均向前。
6. **区分工具输入。** 核心域、访问、identity/skew 和 RAW 给出 isl 可解析字符串；符号 tile size 与 Omega 文本明确停留在伪表示层。

## 常见误区

1. **把读偏移当依赖距离。** `i-1` 读支的 source-to-sink 空间距离是 \(+1\)，`i+1` 读支才是 \(-1\)。
2. **把依赖写成 sink → source。** 三支关系的第一元始终是 producer，调度差始终是 sink 减 source。
3. **遗漏 source 域与 live-in。** \(t=1\) 没有域内 producer；左右边界还分别让两条邻点分支缺失。
4. **只初始化第 0 行。** 当 \(T>1\) 时，中间时间行的左右边界也是 live-in。
5. **把 \((1,-1)\) 判成非法。** identity 的时间维已经严格承载该边。
6. **声称合法性必须 skew。** identity 已合法；skew 只服务本章选择的矩形 tiling 与 wavefront。
7. **把同一 wavefront 全部点无条件并行。** 只证明了相同 \(w\) 的不同 tile 无依赖；tile 内仍按 \((t,y)\) 顺序执行。
8. **去掉波次屏障。** 不同 \(w\) 之间存在 RAW；`nowait` 需要另一个等价完成机制，不能直接删除同步。
9. **漏掉边缘 `min/max`。** tile 矩形必须与时间范围和斜带的两条边同时相交。
10. **把符号 tile 大小当普通 Presburger 输入。** 运行时 \(B_x q_x\) 是变量乘变量；工具 tiling 要固定大小或使用专门 API。
11. **把完整二维 `A` 换成滚动缓冲仍沿用证明。** 地址复用改变 WAR/WAW/RAW，必须重分析。
12. **把 AST 生成成功当语义证明。** 仍须证明不漏、不重、实例恢复和依赖保序。
13. **照抄工具风格文本。** isl 片段按对象解析，Omega 与符号 tiling 段明确只是伪表示；方言边界不能省略。

## 练习

### 练习 EX12-B01｜小规模域、RAW 与 live-in（基础）

取 \(T=2,N=5\)，枚举域、三支精确 RAW 和去重后的 live-in 位置；分别核对每支关系的 source/sink 边界。

**答案索引：** [ANS-EX12-B01](#ans-ex12-b01)

### 练习 EX12-D01｜一般 skew 的距离与下界（推导）

对一般 skew \(\Theta_k(t,i)=(t,kt+i)\)，统一计算 \(\Theta_k(\mathrm{sink})-\Theta_k(\mathrm{source})\) 的三支距离，给出使第二分量全非负的最小整数 \(k\)，并说明 \(k=0\) 为何仍保持词典序合法。

**答案索引：** [ANS-EX12-D01](#ans-ex12-d01)

### 练习 EX12-C01｜Tile、wavefront 与点数全枚举（综合）

取 \(T=4,N=5,B_x=3,B_y=2\)，按定义列出所有非空 tile、wavefront 和点数，检查同一 wavefront 的不同 tile 之间是否存在 RAW，并证明点集不漏不重。

**答案索引：** [ANS-EX12-C01](#ans-ex12-c01)

### 练习 EX12-D02｜精确 y 边界与删项反例（推导）

从 \(x+1\le y\le x+N-2\) 与一个固定 \(y\)-tile 的闭区间重新推导 `y_lo`、`y_hi`；分别删去两个 `max` 候选与两个 `min` 候选中的一项，并各给出越界、错 tile 或重复点反例。

**答案索引：** [ANS-EX12-D02](#ans-ex12-d02)

### 练习 EX12-C02｜滚动缓冲的新访问与潜在 hazard（综合）

把物理存储改成 `A[t % 2][i]`。写出新的 instance → memory 读写关系，并指出会出现哪些潜在 source → sink WAR/WAW；不要沿用本章的并行结论，直到完成新的精确依赖分析。

**答案索引：** [ANS-EX12-C02](#ans-ex12-c02)

## 本章小结

- 从 C 到生成代码的九阶段链是：程序前提、参数/域、访问/live-in、精确 RAW、identity、skew、tile/wavefront、AST/伪 C、语义与工具审计。
- 域为 \(1\le t\le T,\ 1\le i\le N-2\)；完整二维 `A` 的精确域内依赖只有三支 RAW，方向均为 source → sink。
- \(T=3,N=6\) 时共有 12 个实例和 \(6+8+6=20\) 条 RAW；第 0 行与中间时间层左右边界共同构成 live-in。
- identity 距离为 \((1,1),(1,0),(1,-1)\)，已经合法；skew \((t,t+i)\) 把它们变成逐分量非负的 \((1,2),(1,1),(1,0)\)，只为本章的矩形 tiling 目标服务。
- \(\Theta_{\mathrm{wave}}=(q_x+q_y,q_x,r_x,r_y)\) 合法；同一 wavefront 的不同 tile 可以并行，tile 内仍保持顺序，不同波次之间必须有屏障。
- 精确代码边界来自斜域与 tile 的交：时间使用 `max/min`，空间使用 `max(t+1,...)` 与 `min(t+N-2,...)`；它们同时处理边缘 tile。
- Euclidean tile 分解给出不漏不重，调度距离证明给出依赖保序；二者与正确实例恢复共同构成生成代码的语义检查。
- isl 核心片段可按集合/映射对象解析；符号 tile size 和 Omega 文本是明确标注的伪表示。滚动缓冲、别名或新语句都会改变证明前提，必须重新分析。
