# 第 11 章：整数扫描与代码生成

## 直觉

合法调度仍然只是“实例应按什么顺序出现”的数学对象。代码生成还要把这个顺序恢复成有限的 `for`、`if` 和语句调用，并对所有合法参数保证三件事：

1. 原域中的每个整数实例都被生成，因而**不漏点**；
2. 每个原实例只生成一次，因而**不重复**；
3. 生成顺序遵守变换后调度，并能从生成位置恢复正确的原语句实例和访问下标。

所以代码生成不是“把调度矩阵的每一行抄成一层循环”。它是在参数上下文中扫描变换后调度图的整数点：先按调度时间排序，再恢复原坐标。边界需要投影和消元；整数格点会带来 floor、ceil、min、max、stride、整除 guard 和参数分支。Schedule 维可以被缩放、合并或消去，也可能产生没有原像的洞；最终 AST 循环与 schedule 维没有机械一一对应关系。

本章先给出扫描问题的教学定义，再完整推导三角域、同余域和边缘 tile 三类边界。随后用最小反例说明 Fourier–Motzkin 只对实投影精确，直接用于整数投影会丢失同余。最后把这些数学现象与 isl AST 的对象和节点术语对齐。

## 形式定义

### 从调度图定义整数扫描

令参数 \(p\in\mathbb Z^q\) 满足上下文 \(C(p)\)，带语句标识的实例并集记为

\[
D(p)=\biguplus_S D_S(p).
\]

给定调度映射 \(\Theta\)，保留调度时间 \(t\) 与原实例 \(x\) 的图关系：

\[
G_\Theta(p)
=\{(t,x)\mid x\in D(p)\land t=\Theta(x)\}.
\]

代码生成的核心任务可表述为：在 \(C(p)\) 内，枚举 \(G_\Theta(p)\) 的整数点，使 \(t\) 按词典序非降；对同一时间戳上互不依赖的实例，使用一个明确的次级顺序或结构化 `set` 语义；随后从 \((t,x)\) 中取回带语句标识的 \(x\)，生成对应 user statement。若同一时间戳上存在必须严格保序的依赖，则问题早已是非法调度，不能靠扫描器补救。

保留 \(x\) 很重要。只有在调度是一一映射且逆变换适合整数计算时，才可以仅由 \(t\) 直接求逆。非幺模、非单射、含 floor/mod 或引入 tile 坐标的调度，都不应被草率地当作普通矩阵换基。Bastoul 的 [PACT 2004 作者公开稿](https://icps.u-strasbg.fr/~bastoul/research/papers/Bas04-PACT.pdf)通过把新调度维放在原坐标之前并扫描扩展多面体，专门处理一般变换下的实例恢复；这里采用的是对应的教学性图关系，而不声称复现其内部实现。

对固定参数 \(p\)，令 \(E(p)\) 是生成 AST 在该参数下**实际发生的动态 `user` 节点执行事件集合**。一个事件至少记作

\[
e=(u,\ell),
\]

其中 \(u\) 标识静态 AST `user` 节点及其原语句身份；若同一原语句被版本化到多个 AST 位置，\(u\) 还包含该 AST 位置身份。向量 \(\ell\) 收集该事件外围各层循环迭代值。只有沿实际控制流到达并执行了 `user` 节点才形成事件：某次包络循环迭代若 guard 为假，它不产生 `user` 事件，因而不进入 \(E(p)\)；同一个外围循环元组若先后执行 \(P\) 和 \(Q\) 两个 `user` 节点，则因 \(u\) 不同而形成两个可区分事件。

每个 `user` 表达式携带恢复出的原语句实参。由此定义恢复映射

\[
\rho:E(p)\to\biguplus_S D_S(p),
\]

把一次动态 `user` 执行事件还原成带语句标识的原实例。对生成器的点集正确性，可用一个满射条件和一个唯一性条件概括：

\[
\rho[E(p)]=\biguplus_S D_S(p),
\]

\[
\forall [x]_S\in\biguplus_T D_T(p):\quad
\left|\rho^{-1}[\{[x]_S\}]\right|=1.
\]

第一式给出覆盖，第二式排除同一原实例由多个动态 `user` 事件重复产生；合起来使 \(\rho\) 成为 \(E(p)\) 到不交并实例域的双射。**执行次序是双射之外的独立条件。** 若动态 trace 的先后关系记为 \(\prec_E\)，则每条 \(([x]_S,[y]_T)\in\Delta_{S\to T}\) 都必须令唯一事件 \(e_x\in\rho^{-1}[\{[x]_S\}]\)、\(e_y\in\rho^{-1}[\{[y]_T\}]\) 满足 \(e_x\prec_E e_y\)，并与 \(\Theta_S(x)\mathrel{\mathrm{lex}<}\Theta_T(y)\) 一致。实际 `user` 节点还必须把 \(x\) 正确代回原语句参数与访问下标。

### Identity、非幺模时间与 tile 坐标

**Identity 基线。** 令

\[
D_N=\{i\in\mathbb Z\mid0\le i<N\},
\qquad \Theta(i)=i.
\]

则 \(G_\Theta=\{(i,i)\mid0\le i<N\}\)，直接得到：

```c
for (int i = 0; i < N; ++i)
  S(i);
```

**非幺模时间。** 改取 \(\Theta(i)=2i\)。精确调度像是

\[
\{t\in\mathbb Z\mid0\le t<2N\land t\equiv0\pmod2\},
\]

而不是整个整数区间 \([0,2N)\)。可扫描原坐标，也可显式扫描偶数时间：

```c
for (int t = 0; t < 2 * N; t += 2)
  S(t / 2);  // t 可整除 2
```

若错误地令 `t++` 并无条件调用 `S(t / 2)`，奇数时间没有原像，且 C 的整数除法还会把相邻两个时间映到同一实例，既生成伪点又造成重复。

**Tile 坐标。** 对正整数 \(B\)，定义 Euclidean 商余

\[
ii=\left\lfloor\frac{i}{B}\right\rfloor,
\qquad r=i-Bii,
\qquad0\le r<B.
\]

扩展图保留 \((ii,r,i)\) 以及等式 \(i=Bii+r\)。Euclidean 除法定理保证每个 \(i\) 的 \((ii,r)\) 唯一，因此可以按 tile、再按 tile 内位置排序，同时无歧义恢复 `S(i)`。这不是说三维 schedule 必然生成三层循环；等式消元后常只需要 tile loop 和 point loop。

### 整数边界的规范形式

固定外层变量和参数后，若内层整数变量 \(z\) 满足多条有理线性界

\[
z\ge \frac{a_r}{q_r}\quad(q_r>0),
\qquad
z\le \frac{b_s}{d_s}\quad(d_s>0),
\]

则精确整数区间为

\[
\max_r\left\lceil\frac{a_r}{q_r}\right\rceil
\le z\le
\min_s\left\lfloor\frac{b_s}{d_s}\right\rfloor.
\]

`max` 合并下界，`min` 合并上界；若下界大于上界，该分支为空，可以表现为外层参数分支或运行时 guard。同余约束不能仅靠区间界恢复，通常还需要 stride、整除 guard 或显式整数商变量。

这里的 floor/ceil 是数学取整。对正除数 3，

\[
\left\lfloor-\frac13\right\rfloor=-1,
\qquad
\left\lceil-\frac13\right\rceil=0.
\]

而 C 的整数 `/` 对有符号数向 0 截断，`-1 / 3` 为 0；C 的 `%` 也不是一般意义下取非负 Euclidean 余数。只在已证明被除数非负时，普通 `/`、`%` 才可直接充当这些数学运算。否则生成器必须使用语义明确的 `floor_div`、`ceil_div`、Euclidean modulo，或经证明等价的调整公式。

## 手算示例

### 三角域：内层上界依赖外层变量

令参数上下文为 \(N\ge0\)，实例域为

\[
D_N=\{(i,j)\in\mathbb Z^2
\mid0\le i<N\land0\le j\le i\}.
\]

采用 identity 调度 \(\Theta(i,j)=(i,j)\)。先扫描外层 \(i\)。把 \(0\le i<N\) 留作外层边界；固定 \(i\) 后，所有含 \(j\) 的约束已经是

\[
j\ge0,
\qquad j\le i.
\]

下界的 `max` 只有 0，上界的 `min` 只有 \(i\)，因此得到：

```c
for (int i = 0; i < N; ++i)
  for (int j = 0; j <= i; ++j)
    S(i, j);
```

取 \(N=4\)，原域与循环都枚举

```text
(0,0)
(1,0) (1,1)
(2,0) (2,1) (2,2)
(3,0) (3,1) (3,2) (3,3)
```

共有 10 个不同点。逐向证明如下：

- **生成点包含于原域。** 外层保证 \(0\le i<4\)，内层保证 \(0\le j\le i\)，所以每个生成点属于 \(D_4\)。
- **原域包含于生成点。** 任取 \((i,j)\in D_4\)，其 \(i\) 落在外层唯一一次迭代中，其 \(j\) 落在该次内层区间 \([0,i]\) 中，所以一定生成，不漏点。
- **唯一性。** 循环变量的一次取值唯一决定 \((i,j)\)；两个不同迭代对不可能得到同一坐标，所以不重复。

更一般地，若固定外层后同时得到 \(2j\ge i-1\)、\(3j\ge p\)、\(j\le i\)、\(2j\le N-1\)，精确界应写成

\[
\max\left(
\left\lceil\frac{i-1}{2}\right\rceil,
\left\lceil\frac p3\right\rceil
\right)
\le j\le
\min\left(
i,
\left\lfloor\frac{N-1}{2}\right\rfloor
\right).
\]

哪一项实际取到 `max/min` 会随参数和外层变量变化；生成器可以保留 `min/max` 表达式，也可以分成若干参数/外层条件分支。后者可能简化每个分支的边界，却增加代码体积。

### 同余域：stride 与 guard

令

\[
D_N=\{i\in\mathbb Z
\mid0\le i<N\land i\equiv1\pmod3\},
\qquad N\ge0.
\]

引入整数商 \(q\)，把同余精确写为

\[
i=1+3q.
\]

代入区间约束：

\[
0\le1+3q<N.
\]

左侧给出

\[
q\ge\left\lceil-\frac13\right\rceil=0,
\]

右侧因整数严格不等式等价于 \(1+3q\le N-1\)，得到

\[
q\le\left\lfloor\frac{N-2}{3}\right\rfloor.
\]

直接用 \(i=1+3q\) 可生成 stride 版本：

```c
for (int i = 1; i < N; i += 3)
  S(i);
```

也可扫描包络区间并保留 guard：

```c
for (int i = 0; i < N; ++i)
  if (i % 3 == 1)
    S(i);
```

此 guard 中 \(i\ge0\)，所以 C `%` 与所需非负余数一致。若下界允许负数，应改用 Euclidean modulo 判断，或写成“存在整数 \(q\) 使 \(i=1+3q\)”的等价实现，不能未经处理沿用 `i % 3 == 1`。

取 \(N=8\)：

```text
definition: {1, 4, 7}
stride:     {1, 4, 7}
q=0,1,2:    {1, 4, 7}
```

不漏点来自：每个满足 \(i\equiv1\pmod3\) 的整数都存在 \(q\in\mathbb Z\) 使 \(i=1+3q\)，而区间约束恰把 \(q\) 限到 0、1、2。不重复来自：若 \(1+3q_1=1+3q_2\)，则 \(q_1=q_2\)。Stride 直接编码了这个单射；guard 版本中每个 \(i\) 也只被外层循环访问一次。

### 边缘 tile：`min(N, (ii+1)B)` 的来源

为了同时显示左右边缘，令

\[
D=\{i\in\mathbb Z\mid L\le i<N\},
\qquad B\ge1, L<N.
\]

以 0 为 tile 原点，定义

\[
ii=\left\lfloor\frac{i}{B}\right\rfloor.
\]

包含原域点的第一个和最后一个 tile 编号是

\[
ii_{min}=\left\lfloor\frac LB\right\rfloor,
\qquad
ii_{max}=\left\lfloor\frac{N-1}{B}\right\rfloor.
\]

固定 \(ii\) 后，tile 自身给出半开区间

\[
iiB\le i<(ii+1)B,
\]

原域给出 \(L\le i<N\)。两组下界取 `max`、上界取 `min`，得到交集

\[
\max(L,iiB)\le i<\min(N,(ii+1)B).
\]

因此一般代码为：

```c
for (int ii = floor_div(L, B);
     ii <= floor_div(N - 1, B);
     ++ii)
  for (int i = max(L, ii * B);
       i < min(N, (ii + 1) * B);
       ++i)
    S(i);
```

右边缘的 `min(N, (ii+1)B)` 不是经验补丁，而是原域与 tile 区间相交的精确上界；左边缘的 `max(L,iiB)` 完全对称。

当 \(L=0,N>0\) 时，tile 个数为

\[
\left\lfloor\frac{N-1}{B}\right\rfloor+1
=\left\lceil\frac NB\right\rceil,
\]

可写成熟悉的形式：

```c
for (int ii = 0; ii < ceil_div(N, B); ++ii)
  for (int i = ii * B;
       i < min(N, (ii + 1) * B);
       ++i)
    S(i);
```

`ceil_div(N,B)` 在 \(N\ge0,B>0\) 时可实现为 \((N+B-1)/B\)，但这个公式可能溢出，也不能无条件推广到负 \(N\)。一般生成器要使用目标整数类型上经过证明的安全实现。

复算 \(L=1,N=8,B=3\)：

```text
ii=0: i=1,2
ii=1: i=3,4,5
ii=2: i=6,7
```

合并得到 \(\{1,2,3,4,5,6,7\}\)，恰是原域。不漏点：任取原点 \(i\)，唯一的 \(ii=\lfloor i/B\rfloor\) 位于外层范围，且 \(i\) 同时满足原区间和该 tile 区间。不重复：不同 tile 的半开区间 \([iiB,(ii+1)B)\) 两两不交，同一 tile 的 point loop 也不重复取值。

### Fourier–Motzkin：实投影会丢掉整数同余

Fourier–Motzkin elimination 的基本直觉是：要消去变量 \(y\)，把给出 \(y\) 下界和上界的不等式两两配对，生成只含其余变量的必要约束。对实数线性不等式，这给出精确投影；对整数点，它可能只给出实包络。

最小反例取

\[
P=\{(x,y)\in\mathbb R^2
\mid x-2y\le0\land-x+2y\le0\}.
\]

两条不等式合起来就是 \(x=2y\)。第一条给 \(2y\ge x\)，第二条给 \(2y\le x\)。在实数上消去 \(y\) 时，上下界配对只产生恒真式 \(0\le0\)，所以

\[
\operatorname{proj}^{\mathbb R}_x(P)=\mathbb R.
\]

但若原变量必须为整数，

\[
\begin{aligned}
\operatorname{proj}^{\mathbb Z}_x(P\cap\mathbb Z^2)
&=\{x\in\mathbb Z\mid\exists y\in\mathbb Z:x=2y\}\\
&=\{x\in\mathbb Z\mid x\equiv0\pmod2\}.
\end{aligned}
\]

所有奇数都在实投影中，却没有整数原像。由此不能把 Fourier–Motzkin 说成整数精确消元：floor/ceil 可以把有理上下界收紧到整数区间，但这里没有边界可收紧，同余信息仍需 stride、`x % 2 == 0` guard、显式整数商，或 Cooper/Omega 一类整数方法恢复。Cooper 的[原文扫描](https://www21.in.tum.de/teaching/logik/SS16/Exercises/Cooper.pdf)是整数线性算术量词消去的来源；Fourier–Motzkin 的实投影直觉不能替代它。

### 参数分支、guards 与代码膨胀

扫描多个多面体或多条分段界时，哪一个下界成为 `max`、哪一个上界成为 `min`，可能依赖参数。例如

\[
\max(0,P-N)\le i<\min(P,N)
\]

在 \(P\le N\)、\(N<P\le2N\)、\(P>2N\) 等上下文中会简化成不同边界或空域。生成器有三种常见选择：

1. 保留 `max/min` 表达式；
2. 生成参数 `if`，在每个分支使用更简单的循环；
3. 扫描较大的包络，再用实例 guard 过滤。

分支越细，循环边界可能越简单，但代码体积和指令缓存压力越大；guard 越多，动态控制开销可能越高。Quilleré、Rajopadhye 与 Wilde 的[参数化多面体循环生成论文](https://doi.org/10.1023/A:1007554627716)讨论了高效嵌套循环生成及代码大小与控制开销的权衡；Bastoul 的方法继续面向变换后多面体的扫描和控制简化。二者都不保证任意输入上产生全局最短、无 guard 或最快的代码。

## 编译器用途

### isl 中 schedule、context 与 AST 节点的角色

以下工具术语依据 [isl 官方手册 0.28](https://libisl.sourceforge.io/user.html)及其 [PDF](https://libisl.sourceforge.io/manual.pdf)，访问日期均为 **2026-07-22**：

- **Schedule tree（`isl_schedule`）** 是结构化调度，包含 domain、band、filter、sequence/set、context、mark 等输入节点。树中最靠近根、同时涉及两个实例并把它们区分开的节点递归决定相对次序。
- **Schedule map（`isl_union_map`）** 把域实例映到 schedule space。交给 AST 生成器时，域元素按对应像的词典序访问；它是扁平关系表示，不等同于 schedule tree。
- **AST build context** 可由 `isl_ast_build_from_context(set)` 建立；该集合通常只含参数约束。从 `isl_schedule` 生成 AST 时，手册要求这里是参数集。它与 schedule tree 中的 `context` 节点相关但不是同一个对象：前者是 AST build 的初始上下文，后者位于树内并可约束参数和外层 band 维。
- **AST `for` 节点** 表达生成的循环及其迭代器、初始化、条件、步进和主体。一个 `for` 不保证对应一个原循环或一个 schedule 维。
- **AST `if` 节点** 表达运行时条件分支，可能来自参数分段、边界或 guard；schedule-tree `filter` 本身不是 AST `if`。
- **AST `user` 节点** 是访问某个域元素时产生的表达式语句，通常携带原语句标识和恢复后的实例实参。它不是原语句体语义保持的自动证明。
- AST 还可包含 `block` 与 `mark` 节点；`mark` 可对应调度树标记，但标记的含义仍由使用者约定。

手册给出的稳定入口包括 `isl_ast_build_node_from_schedule` 和 `isl_ast_build_node_from_schedule_map`。AST 表达式支持 `min`、`max`、向负无穷取整的正除数商 `fdiv_q` 以及余数/整除条件，因此分段边界、floor division 和 guards 都是精确整数扫描的正常结果，不是生成失败。

对 schedule tree 输入，AST 生成选项可附在 band；`isl_schedule_node_band_tile` 会在原 band 与其子树之间创建 point-loop band，使外层表达 tile、内层表达 tile 内点。即便如此，最终 AST 仍由扫描、消元、边界简化和选项共同决定；不能宣布“两个 band 必定原样打印成两层同名 C 循环”。

### 从数学对象到可执行代码的检查链

编译器至少要完成以下链条：

1. 在参数上下文内确定带语句标识的整数实例域；
2. 取得已经由第 8–10 章证明合法的 schedule map 或 schedule tree；
3. 扫描调度图或等价的扩展整数集合，生成精确上下界、stride、参数分支和 guards；
4. 证明生成迭代与原实例之间覆盖且唯一；
5. 在 user 节点恢复原语句实参和数组访问下标；
6. 检查生成顺序保持全部 source → sink 依赖，并检查目标语言整数除法、溢出和数值语义。

Quilleré–Rajopadhye–Wilde 与 Bastoul 支持的是 polyhedral scanning 和控制结构生成路线；isl 手册支持的是工具对象与 API 语义。它们都不替代依赖合法性、点集双射和原语句体替换正确性的证明。进一步的语义保持视角可参阅 [*Verified Code Generation for the Polyhedral Model*](https://xavierleroy.org/publi/polyhedral-codegen.pdf)。

## 常见误区

1. **把代码生成说成逆调度矩阵。** 非幺模、非单射、floor/mod 和 tile 坐标都可能没有普通整数逆矩阵。
2. **扫描调度像的包络而忽略洞。** \(t=2i\) 的像只有偶数；扫描所有整数时间会生成无原像点。
3. **认为 schedule 维与 AST 循环一一对应。** 消元、缩放、分段、合并和 guard 都会改变 AST 形状。
4. **把 \(E(p)\) 定义为所有循环迭代元组。** Guard 为假的包络迭代没有 `user` 事件；同一循环元组又可能执行多个不同 `user`。事件必须包含 `user`/语句身份并只收集实际到达者。
5. **只证明生成点属于原域。** 这只能排除伪点，还必须证明每个原点被动态 `user` 事件覆盖且只被覆盖一次。
6. **把点集双射当成次序证明。** 双射只证明不漏不重；source → sink 的动态执行先后必须另查。
7. **把数学 floor 当作 C `/`。** 对负数，向负无穷取整与向 0 截断不同。
8. **把 C `%` 当作 Euclidean modulo。** 负被除数时余数符号和剩余类判断必须另行处理。
9. **用 floor/ceil 代替同余。** 它们收紧区间界，却不能从 \(x=2y\) 的实投影中恢复“\(x\) 为偶数”。
10. **把 Fourier–Motzkin 称为整数精确消元。** 它对实线性投影精确；整数投影还要保留整除和同余。
11. **漏掉边缘 tile 的 `min/max`。** 完整 tile 上界会在最后一块生成越界点，负的左边缘也需要 `max`。
12. **无条件使用 `(N+B-1)/B`。** 公式依赖符号条件且可能溢出；一般情形需语义明确的 ceil division。
13. **把 schedule-tree `filter` 当作 AST `if`。** 两者属于输入调度结构和输出控制结构的不同层次。
14. **把 AST 生成成功当成语义证明。** 仍需合法调度、点集不漏不重、实例恢复和语句体替换正确。
15. **认为分支越细代码越好。** 参数分段可能降低循环控制，却造成代码膨胀和指令缓存压力。

## 练习

### 练习 EX11-B01｜三角域 identity 扫描（基础）

对 \(D=\{(i,j)\mid0\le i<N\land i\le j<N\}\) 推导 identity 扫描循环。取 \(N=4\) 列出全部点，并分别证明不漏点和不重复。

**答案索引：** [ANS-EX11-B01](#ans-ex11-b01)

### 练习 EX11-D01｜负数同余域的 stride（推导）

对 \(D=\{i\mid-5\le i<5\land i\equiv1\pmod3\}\)，用 Euclidean 商变量推导 stride 的起点与终点；再说明 C 表达式 `i % 3 == 1` 会漏掉哪些负数点。

**答案索引：** [ANS-EX11-D01](#ans-ex11-d01)

### 练习 EX11-B02｜非幺模调度像扫描（基础）

对调度 \(t=3i\)、\(0\le i<4\)，列出精确调度像。分别写出 stride 扫描和包络加整除 guard 的代码，并说明如何恢复 \(i\)。

**答案索引：** [ANS-EX11-B02](#ans-ex11-b02)

### 练习 EX11-D02｜负左边界的 tile floor（推导）

取 \(L=-2,N=5,B=3\)，用数学 floor 计算 \(ii_{min},ii_{max}\)，逐 tile 列出点。再用 C 向 0 截断的 `L/B` 比较，指出错误的外层起点。

**答案索引：** [ANS-EX11-D02](#ans-ex11-d02)

### 练习 EX11-D03｜二维边缘 tile 枚举（推导）

对二维矩形 \(0\le i<M\land0\le j<N\) 做 \(2\times3\) tiling。取 \(M=3,N=5\)，列出四个边缘/完整 tile 的点，并说明 tile 编号与点内坐标为何共同唯一确定原点。

**答案索引：** [ANS-EX11-D03](#ans-ex11-d03)

### 练习 EX11-D04｜Ceil/max 与 floor 边界（推导）

从约束 \(3j\ge i-2\)、\(2j\le N+i\)、\(j\ge0\) 推导 \(j\) 的 `ceil/max` 下界与 `floor` 上界；写出内层为空时需要的条件。

**答案索引：** [ANS-EX11-D04](#ans-ex11-d04)

### 练习 EX11-C01｜Fourier–Motzkin 的整数缺口（综合）

对整数等式 \(x=3y+1\) 做实 Fourier–Motzkin 消元，比较实投影与整数投影；给出正确的 stride 或 Euclidean guard。

**答案索引：** [ANS-EX11-C01](#ans-ex11-c01)

### 练习 EX11-B03｜Schedule-tree context 与 AST build context（基础）

解释 schedule-tree `context` 节点与 `isl_ast_build_from_context(set)` 的区别，并各给出一个它们可以携带的约束例子。

**答案索引：** [ANS-EX11-B03](#ans-ex11-b03)

### 练习 EX11-C02｜参数分段与代码体积（综合）

设计一个参数界，使保留 `min/max` 只需一份循环，而完全分段需要至少三个参数分支（允许其中包含空域分支）。给出分支覆盖证明，并比较动态分支、代码体积和可优化性的取舍。

**答案索引：** [ANS-EX11-C02](#ans-ex11-c02)

### 练习 EX11-C03｜动态 user 事件的四项审计（综合）

考虑 `for ell in L` 的包络循环；当 \(g(\ell)\) 为真时，依次执行两个静态 `user` 节点 \(u_P(\operatorname{args}_P(\ell))\)、\(u_Q(\operatorname{args}_Q(\ell))\)。写动态事件键，并给出覆盖、唯一、依赖次序、实参恢复四项符号审计条件；说明 guard 为假与同一 \(\ell\) 上两个 `user` 的处理。

**答案索引：** [ANS-EX11-C03](#ans-ex11-c03)

## 本章小结

- 代码生成是在参数上下文中按调度时间扫描 \(G_\Theta=\{(t,x)\mid x\in D,t=\Theta(x)\}\) 的整数点，并恢复原语句实例；它不是机械地把 schedule 维翻译成 AST 循环。
- \(E(p)\) 只含实际到达的动态 `user` 执行事件，事件键含 `user`/语句身份和外围循环值；它通过 \(\rho\) 与不交并实例域双射，而 source → sink 动态次序是双射之外的独立条件。
- Identity 调度可直接扫描原坐标；\(t=2i\) 的非幺模调度像含偶数洞结构；tile 坐标依靠 Euclidean 商余唯一恢复原点。
- 三角域产生依赖外层变量的界；\(i\equiv1\pmod3\) 产生 stride 或 guard；边缘 tile 由原域与 tile 区间相交产生 `max(L,iiB)` 和 `min(N,(ii+1)B)`。
- 三个小参数枚举分别验证了三角域 \(N=4\)、同余域 \(N=8\) 和 tile \(L=1,N=8,B=3\) 的不漏点与不重复。
- Floor/ceil 是数学取整，不能对负值无条件使用 C 的向 0 截断 `/` 和非 Euclidean `%`；`min/max`、stride、guards 与参数分支都可能是精确扫描所必需。
- Fourier–Motzkin 对实线性投影精确，却会在整数投影 \(x=2y\) 中丢掉偶数同余；它不是整数精确消元。
- isl 的 schedule tree、schedule map、AST build context 与 `for`/`if`/`user` 节点属于不同层次；官方手册不保证 schedule 维与 AST 循环一一对应。
- Quilleré、Bastoul 与 isl 分别支撑多面体循环生成、变换后扫描和工具表示语义；它们都不自动证明输入调度合法或最终程序值语义保持。
