# 附录：练习答案、符号速查与延伸阅读

<a id="appendix"></a>

本附录按稳定练习 ID 给出可核对答案。依赖关系始终按 source → sink 读取，访问关系始终按 instance → memory 读取；调度距离统一取

\[
d=\Theta(\mathrm{sink})-\Theta(\mathrm{source}).
\]

## 参考答案：第 1 章

<a id="ans-ex01-b01"></a>
### 参考答案 EX01-B01｜矩形域枚举与计数

\(D_{\mathrm{rect}}(2,3)\) 中 \(i=0,1\)，\(j=0,1,2\)，所以点集为

\[
\{(0,0),(0,1),(0,2),(1,0),(1,1),(1,2)\}.
\]

在 \(N,M\ge0\) 下，每个 \(i\) 对应 \(M\) 个 \(j\)，共有 \(NM\) 个整数点；若任一尺寸为 0，公式同样给出 0。

<a id="ans-ex01-d01"></a>
### 参考答案 EX01-D01｜三角域计数与语言边界

\(D_{\mathrm{tri}}(5)\) 的点为

```text
(0,0)
(1,0) (1,1)
(2,0) (2,1) (2,2)
(3,0) (3,1) (3,2) (3,3)
(4,0) (4,1) (4,2) (4,3) (4,4)
```

点数是 \(1+2+3+4+5=15\)。一般地，

\[
\sum_{i=0}^{N-1}(i+1)=\frac{N(N+1)}2.
\]

右式是分析者在元层面总结点数的闭式，不是定义域的 Presburger 公式。域公式仍只有 \(0\le i<N\)、\(0\le j\le i\) 等线性约束；把 \(N(N+1)\) 放进待判定公式才会引入变量乘变量。

<a id="ans-ex01-b02"></a>
### 参考答案 EX01-B02｜仿射下标判定

- `A[2*i+N]` 是仿射访问：2 是固定系数，\(N\) 是参数。
- `A[i+j]` 是仿射访问：下标是两个实例坐标的线性和。
- `A[i*j]` 不是仿射访问：它含两个一般变量的乘积。
- `A[index[i]]` 不能仅由 \(i\) 和参数精确写成经典仿射访问：物理地址取决于运行时数组值。

<a id="ans-ex01-c01"></a>
### 参考答案 EX01-C01｜参数化斜三角域

取参数上下文

\[
C(N,M):N\ge0\land M\ge0,
\]

语句域为

\[
D_S=\{[i,j]_S\mid0\le i<N\land i\le j<M\}.
\]

若 \(N>M\)，域通常不为空；只是 \(i\ge M\) 的外层迭代没有内层点。非空实例实际满足 \(0\le i<M\)，点数为

\[
\sum_{i=0}^{M-1}(M-i)=\frac{M(M+1)}2.
\]

只有 \(M=0\) 时整个域为空。

## 参考答案：第 2 章

<a id="ans-ex02-b01"></a>
### 参考答案 EX02-B01｜同余的量词形式与自由变量

\[
x\equiv2\pmod5
\iff\exists k\in\mathbb Z:\ x=5k+2.
\]

\(k\) 被量词绑定，故自由变量集合为 \(\operatorname{FV}=\{x\}\)。模数 5 是固定常数。

<a id="ans-ex02-d01"></a>
### 参考答案 EX02-D01｜Presburger 可定义性判定

- \(x=4y-N\) 可定义：4 是固定系数，\(N\) 只线性出现。
- \(x=Ny\) 一般不可定义：\(N\) 与 \(y\) 都是变量。
- \(x=y+z\) 可定义。
- \(x=|y|\) 可写成有限析取

\[
(y\ge0\land x=y)\lor(y\le0\land x=-y).
\]

\(y=0\) 时两支重叠不改变定义的关系。

<a id="ans-ex02-d02"></a>
### 参考答案 EX02-D02｜固定步长循环建模

存在计数器形式为

\[
\{i\in\mathbb Z\mid\exists k\in\mathbb Z:\ k\ge0\land i=2+4k\land i\le20\}.
\]

等价同余形式为

\[
\{i\in\mathbb Z\mid2\le i\le20\land i\equiv2\pmod4\}.
\]

\(k=0,1,2,3,4\) 分别给出 \(\{2,6,10,14,18\}\)；\(k=5\) 得 22，越过上界。

<a id="ans-ex02-b02"></a>
### 参考答案 EX02-B02｜整数版与自然数版真值

方程 \(2x+1=0\) 的唯一有理解是 \(x=-1/2\)，不是整数。因此它在 \(\mathbb Z\) 上为假，在 \(\mathbb N\) 上也为假。这道题答案唯一，却不能区分两个论域；例如 \(\exists x:x+1=0\) 才会在 \(\mathbb Z\) 上为真（见证 \(-1\)）、在 \(\mathbb N\) 上为假。

<a id="ans-ex02-c01"></a>
### 参考答案 EX02-C01｜析取域的参数边界

- \(N=0\) 时，\(0\le i<0\) 与 \(0\le i<0\) 两支都空，结果为空集。
- \(N=2\) 时，第一支给 \(\{0,1\}\)，第二支给 \(\{4,5\}\)，结果为 \(\{0,1,4,5\}\)。

整数 2、3 没有任一分支见证，不能以凸包区间 \([0,5]\) 代替该析取集合。

## 参考答案：第 3 章

<a id="ans-ex03-d01"></a>
### 参考答案 EX03-D01｜偶数区间的量词消去

从 \(c\) 向上的最小偶数在 \(c\) 偶时为 \(c\)，在 \(c\) 奇时为 \(c+1\)。所以量词自由式可写为

\[
(c\equiv0\pmod2\land c\le d)
\lor
(c\equiv1\pmod2\land c+1\le d).
\]

整数同余按 Euclidean 剩余类解释，因此该式对负 \(c\) 也成立。

<a id="ans-ex03-d02"></a>
### 参考答案 EX03-D02｜带正下界的三角投影

\[
\exists j:\ 1\le j\le i\land0\le i<N
\iff1\le i<N.
\]

正向由 \(1\le j\le i\) 得 \(i\ge1\)；反向对任意 \(1\le i<N\) 取见证 \(j=1\)。它与下界 \(j\ge0\) 的普通三角域投影不同。

<a id="ans-ex03-b01"></a>
### 参考答案 EX03-B01｜仿射像与同余类

\[
\exists x\in\mathbb Z:\ z=4x+1
\iff z\equiv1\pmod4.
\]

它没有 \(z\ge1\) 的下界，例如 \(x=-1\) 给 \(z=-3\)。反过来，条件 \(z\ge1\) 会错误加入 2、3、4 等非目标剩余类。

<a id="ans-ex03-c01"></a>
### 参考答案 EX03-C01｜析取投影构造

取

\[
X=\{(i,j)\in\mathbb Z^2\mid
(0\le i\le1\land j=0)
\lor(4\le i\le5\land j=1)\}.
\]

第一支以 \(j=0\) 为见证，第二支以 \(j=1\) 为见证，所以

\[
\operatorname{proj}_i(X)=\{0,1\}\cup\{4,5\}.
\]

整数 2、3 在任一分支都没有 \(j\) 见证，故投影仍是两个分离区间。

<a id="ans-ex03-b02"></a>
### 参考答案 EX03-B02｜查询种类辨析

1. 固定 \(N=N_0\) 后，\(\exists i:\varphi(i,N_0)\) 是可满足性查询。
2. 令 \(p\) 收集自由参数、\(C(p)\) 为参数上下文，则完整查询是
   \[
   \forall p:\ C(p)\Rightarrow
   \forall i:\bigl(\varphi(i,p)\Rightarrow\psi(i,p)\bigr).
   \]
   这是相对于参数上下文的有效性或全称蕴含查询；等价地，可检查
   \(C(p)\land\varphi(i,p)\land\neg\psi(i,p)\) 是否不可满足。若参数已固定为某个合法值，就只闭包 \(i\)。
3. 求 \(\exists j:\varphi(i,j)\) 的无 \(j\) 公式，是投影，也就是存在量词消去。

若第 1 项不固定 \(N\)，其结果是保留参数 \(N\) 的可行条件，本质上同样是把 \(i\) 投影掉；因此“可满足性”和“投影”取决于哪些变量被固定、哪些被保留。

## 参考答案：第 4 章

<a id="ans-ex04-b01"></a>
### 参考答案 EX04-B01｜Relation 的 domain/range/inverse/image

对 \(R=\{i\to j\mid0\le i<8\land j=3i+2\}\)，

\[
\begin{aligned}
\operatorname{domain}(R)&=\{i\mid0\le i<8\},\\
\operatorname{range}(R)&=\{j\mid2\le j\le23\land j\equiv2\pmod3\},\\
R^{-1}&=\{j\to i\mid0\le i<8\land j=3i+2\}.
\end{aligned}
\]

偶数输入子集为 \(\{0,2,4,6\}\)，其像为 \(\{2,8,14,20\}\)。逆关系若写成除法形式，必须保留 \(j-2\) 可被 3 整除的条件。

<a id="ans-ex04-d01"></a>
### 参考答案 EX04-D01｜奇偶三角域投影

对 \(N\ge1\)，任取 \(0\le i<N\)，选 \(j=i\) 即满足 \(i\le j<N\) 和同奇偶，故 \(i\) 投影为 \([0,N)\cap\mathbb Z\)。任取 \(0\le j<N\)，同样选 \(i=j\)，故 \(j\) 投影也相同。

\(N=0\) 时原集及两投影均空；\(N=1\) 时原集只有 \((0,0)\)，两投影均为 \(\{0\}\)。

<a id="ans-ex04-d02"></a>
### 参考答案 EX04-D02｜三关系复合与 isl 调用顺序

类型链为 \(X\xrightarrow{A}Y\xrightarrow{B}Z\xrightarrow{C}W\)，所以

\[
(C\circ B\circ A)(x,w)
\iff\exists y\in Y\,\exists z\in Z:\ A(x,y)\land B(y,z)\land C(z,w).
\]

对应 isl 调用为

```text
A.apply_range(B).apply_range(C)
```

第一步得到 \(B\circ A:X\to Z\)，第二步得到 \(C\circ B\circ A:X\to W\)。

<a id="ans-ex04-d03"></a>
### 参考答案 EX04-D03｜Euclidean floor 与 modulo 展开

Floor 图可写为

\[
q=\left\lfloor\frac{i-4}{5}\right\rfloor
\iff5q\le i-4<5(q+1).
\]

当 \(i=-2\) 时，\(i-4=-6\)，唯一商是 \(q=-2\)，因为 \(-10\le-6<-5\)。Euclidean 余数图为

\[
\exists k\in\mathbb Z:\ i=5k+r\land0\le r<5.
\]

当 \(i=-2\) 时取 \(k=-1,r=3\)，即 \(-2=5(-1)+3\)。这与 C 对负数的向 0 截断除法不同。

<a id="ans-ex04-c01"></a>
### 参考答案 EX04-C01｜访问复合的类型与方向

\(W_S:D_S\to M\)，\(R_T^{-1}:M\to D_T\)，所以

\[
R_T^{-1}\circ W_S:D_S\to D_T.
\]

它先从 source 写实例走到内存，再沿读访问逆关系走到 sink 读实例，是 \(S\to T\) 同址候选；isl 写作 `W_S.apply_range(R_T.reverse())`。

反式 \(W_S^{-1}\circ R_T:D_T\to D_S\) 从 \(T\) 走回 \(S\)，方向相反。二者都只是同址候选；精确 RAW 还需原始事件顺序与 last-write 条件。

## 参考答案：第 5 章

<a id="ans-ex05-b01"></a>
### 参考答案 EX05-B01｜同余类的线性集表示

在 \(\mathbb N\) 上，所求集合为

\[
L(2;5)=\{2+5n\mid n\in\mathbb N\}.
\]

对应 Presburger 公式是

\[
x\ge0\land\exists n\in\mathbb N:\ x=2+5n,
\]

等价地可写成 \(x\ge0\land x\equiv2\pmod5\)。

<a id="ans-ex05-d01"></a>
### 参考答案 EX05-D01｜二维生成元枚举与成员见证

一般点为

\[
(x,y)=(0,1)+n_1(2,0)+n_2(0,3)=(2n_1,1+3n_2).
\]

在 \(n_1+n_2\le3\) 下：

\[
\begin{array}{c|l}
n_1+n_2&\text{点}\\ \hline
0&(0,1)\\
1&(2,1),(0,4)\\
2&(4,1),(2,4),(0,7)\\
3&(6,1),(4,4),(2,7),(0,10)
\end{array}
\]

共 10 个互异点。回到不带截断的完整线性集，\((4,7)\) 有见证 \((n_1,n_2)=(2,2)\)，所以属于；\((3,7)\) 不属于，因为第一坐标恒为偶数，不可能满足 \(2n_1=3\)。

<a id="ans-ex05-d02"></a>
### 参考答案 EX05-D02｜从整数到自然数的差编码

令 \(z=u-v\)，其中 \(u,v\in\mathbb N\)。不等式变为

\[
u-v\le-2\iff u+2\le v.
\]

同余的整数商也要差编码。写 \(q=q_+-q_-\)，\(q_+,q_-\in\mathbb N\)，则

\[
u-v=1+3(q_+-q_-)
\iff u+3q_-=v+1+3q_+.
\]

令 \(E(u,v)\) 表示差编码后的自然数关系。仅把 \(u,v\) 保留为自由变量时，完整公式为

\[
E(u,v)\iff
u,v\in\mathbb N\land
\exists q_+,q_-\in\mathbb N:
\bigl(u+2\le v\land u+3q_-=v+1+3q_+\bigr).
\]

<a id="ans-ex05-c01"></a>
### 参考答案 EX05-C01｜\(\mathbb Z^2\) 的有限半线性分解

定义

\[
L_{\mathbb Z}(b;p_1,p_2)
=\{b+n_1p_1+n_2p_2\mid n_1,n_2\in\mathbb N\}.
\]

取

\[
\begin{aligned}
L_{++}&=L_{\mathbb Z}((0,0);(1,0),(0,1)),\\
L_{-+}&=L_{\mathbb Z}((-1,0);(-1,0),(0,1)),\\
L_{+-}&=L_{\mathbb Z}((0,-1);(1,0),(0,-1)),\\
L_{--}&=L_{\mathbb Z}((-1,-1);(-1,0),(0,-1)).
\end{aligned}
\]

四支分别覆盖 \(x,y\ge0\)、\(x\le-1,y\ge0\)、\(x\ge0,y\le-1\)、\(x,y\le-1\)，其并恰为 \(\mathbb Z^2\)。允许周期向量含负坐标；要求非负的是系数 \(n_r\)。

<a id="ans-ex05-c02"></a>
### 参考答案 EX05-C02｜四类对象与表示成本

这里区分：单个凸多面体格点集 \(P\cap\mathbb Z^d\)、有限个此类集合的并、一般 Presburger/半线性集；连续多面体 \(P\) 本身不放入离散包含链。

| 对象 | 单个 \(P\cap\mathbb Z^d\) | 有限并 | Presburger/半线性 | 理由 |
|---|---:|---:|---:|---|
| \(\{0,2,4,6\}\) | 否 | 是 | 是 | 单个一维凸区间若含 0、2，也含 1；四个单点之并可表示 |
| \(\{2n\mid n\in\mathbb N\}\) | 否 | 否 | 是 | 无穷多个奇数孔洞不能由有限个一维区间或射线持续排除 |
| 固定 \(N\) 的 \(T_N\) | 是 | 是 | 是 | 它是一个有理三角形的全部格点 |
| 题设两个矩形的整数点并 | 否 | 是 | 是 | 任一含 \((1,0)\)、\((3,0)\) 的凸集也含被排除的 \((2,0)\) |

固定 \(N\) 的三角域若逐点写成零周期半线性并，需要 \(\Theta(N^2)\) 个分支，而多面体不等式仍为常数规模；偶数集则用一个周期生成元很紧凑，却不能用有限个普通凸分支表示。因此集合类包含不保持表示成本。

<a id="ans-ex05-c03"></a>
### 参考答案 EX05-C03｜单个同余类不是单凸多面体格点集

设 \(m\ge2\)、\(0\le r<m\)。反设一维凸多面体 \(P\) 满足

\[
P\cap\mathbb Z=\{r+km\mid k\in\mathbb N\}.
\]

右侧含相邻类内点 \(r+km\) 与 \(r+(k+1)m\)。凸性迫使两点间整段属于 \(P\)，特别是整数 \(r+km+1\in P\cap\mathbb Z\)。但 \(m\ge2\) 时该点不与 \(r\) 模 \(m\) 同余，矛盾。

## 参考答案：第 6 章

<a id="ans-ex06-b01"></a>
### 参考答案 EX06-B01｜仿射读写访问建模

类型和对象为

\[
\begin{aligned}
C&=\{N\in\mathbb Z\mid N\ge0\},\\
D_S&=\{S[i]\mid0\le i<N\},\\
R_S&=\{S[i]\to A[a]\mid a=i\}:D_S\to M_A,\\
W_S&=\{S[i]\to B[b]\mid b=2i+1\}:D_S\to M_B,\\
\Theta_S&=\{S[i]\to[i]\}:D_S\to\mathbb Z.
\end{aligned}
\]

参数 \(N\) 只出现在上下文和域界中，不是实例 tuple 坐标；两条访问均按 instance → memory 读取。

<a id="ans-ex06-b02"></a>
### 参考答案 EX06-B02｜三角写域建模与枚举

以 \(S(i,j)\) 写 \(X[i,j]\) 为例：

\[
\begin{aligned}
C&=\{N\in\mathbb Z\mid N\ge0\},\\
D_S&=\{S[i,j]\mid0\le j\le i<N\},\\
W_S&=\{S[i,j]\to X[a,b]\mid a=i\land b=j\},\\
\Theta_S&=\{S[i,j]\to[i,j]\}.
\end{aligned}
\]

\(N=3\) 时实例为

\[
S[0,0],S[1,0],S[1,1],S[2,0],S[2,1],S[2,2],
\]

共 6 个。

<a id="ans-ex06-d01"></a>
### 参考答案 EX06-D01｜位移消费者的域与读关系

消费者只在安全内点执行，所以

\[
\begin{aligned}
D_T&=\{T[j]\mid1\le j<N\},\\
R_T&=\{T[j]\to B[b]\mid b=j-1\}:D_T\to M_B.
\end{aligned}
\]

当 \(N\ge2\) 时，\(j=1\) 读 \(B[0]\)，\(j=N-1\) 读 \(B[N-2]\)，故地址范围为 \(0\le b<N-1\)；当 \(N=1\) 时，消费者域与地址集均为空。题面选择缩域语义，因此不需要假设外部 `B[-1]` 边界值。

<a id="ans-ex06-c01"></a>
### 参考答案 EX06-C01｜矩阵乘初始化与同维时间戳

设参数 \(M,N,K\ge0\)，初始化与更新使用不同 tuple：

\[
\begin{aligned}
D_I&=\{I[i,j]\mid0\le i<M\land0\le j<N\},\\
W_I&=\{I[i,j]\to C[a,b]\mid a=i\land b=j\},\\
\Theta_I(i,j)&=(i,j,-1),\\
D_U&=\{U[i,j,k]\mid0\le i<M\land0\le j<N\land0\le k<K\},\\
R_U^A&=\{U[i,j,k]\to A[a,c]\mid a=i\land c=k\},\\
R_U^B&=\{U[i,j,k]\to B[c,b]\mid c=k\land b=j\},\\
R_U^C=W_U^C&=\{U[i,j,k]\to C[a,b]\mid a=i\land b=j\},\\
\Theta_U(i,j,k)&=(i,j,k).
\end{aligned}
\]

固定 \((i,j)\) 时，\((i,j,-1)\mathrel{\mathrm{lex}<}(i,j,0)\)，所以初始化严格早于第一次更新。也可把初始化末维设为 0、更新末维设为 \(k+1\)。

<a id="ans-ex06-b03"></a>
### 参考答案 EX06-B03｜间接访问的建模边界

`A[B[i]]` 的物理下标是运行时读取的数据值 \(B[i]\)，不是 \(i,N\) 的固定系数仿射式。经典静态仿射模型不能精确写出这一访问。可保留为不可解释访问、借助别名或值域分析构造保守过近似，或用运行时检查选择特化路径；直接改写成 `A[i]` 会改变程序语义。

## 参考答案：第 7 章

<a id="ans-ex07-b01"></a>
### 参考答案 EX07-B01｜两语句 shift 的精确 RAW

域和访问为

\[
\begin{aligned}
D_P&=\{P[i]\mid0\le i<N\},&W_P&=\{P[i]\to A[a]\mid a=i\},\\
D_Q&=\{Q[j]\mid1\le j<N\},&R_Q&=\{Q[j]\to A[a]\mid a=j-1\}.
\end{aligned}
\]

同址候选为

\[
R_Q^{-1}\circ W_P
=\{P[i]\to Q[j]\mid i=j-1\}
=\{P[i]\to Q[i+1]\mid0\le i<N-1\}.
\]

原程序先执行全部 \(P\)，再执行全部 \(Q\)，故每个 source \(P[i]\) 早于 sink \(Q[i+1]\)；两者之间没有其他地址 \(A[i]\) 的写，所以 source 是 last write。上式即精确 RAW。

<a id="ans-ex07-d01"></a>
### 参考答案 EX07-D01｜删除覆盖写后的 RAW 重算

原例在同一地址上有 \(S[i]\prec U[i]\prec T[i]\)，其中 \(S,U\) 写、\(T\) 读。原候选含 \(S[i]\to T[i]\) 与 \(U[i]\to T[i]\)；前一支被中间写 \(U[i]\) 覆盖，精确 RAW 只留 \(U[i]\to T[i]\)。

删除 \(U\) 后，从新访问重建候选只剩 \(S[i]\to T[i]\)，中间写集合为空，故

\[
\operatorname{Covered}=\varnothing,
\qquad
\Delta_{\mathrm{RAW}}=\{S[i]\to T[i]\}.
\]

因此必须重算，不能只从旧精确关系中删除含 \(U\) 的边。

<a id="ans-ex07-d02"></a>
### 参考答案 EX07-D02｜四次连续写的精确 WAW 链

设对每个 \(i\)，四个同址写满足

\[
P[i]\prec Q[i]\prec R[i]\prec Z[i].
\]

有序同址候选有 \(P\to Q,P\to R,P\to Z,Q\to R,Q\to Z,R\to Z\) 六支。按 next-write 只保留 source 后第一次同址写，精确 WAW 为

\[
\{P[i]\to Q[i]\}:D_P\to D_Q
\;\cup\;
\{Q[i]\to R[i]\}:D_Q\to D_R
\;\cup\;
\{R[i]\to Z[i]\}:D_R\to D_Z.
\]

其余三支都越过了更早的同址写。

<a id="ans-ex07-d03"></a>
### 参考答案 EX07-D03｜模 3 排除伪冲突

同址要求

\[
3i=3j+1\iff3(i-j)=1.
\]

左边模 3 为 0，右边模 3 为 1，因此没有整数解，source \(S\) 到 sink \(T\) 的 RAW 候选和精确 RAW 都为空。若只用实地址区间包络，\([0,3N-3]\) 与 \([1,3N-2]\) 在 \(N\ge2\) 时相交，会产生伪冲突；错误来自丢失同余信息。

<a id="ans-ex07-c01"></a>
### 参考答案 EX07-C01｜矩阵乘初始化 RAW 与归约边

沿用 EX06-C01。固定 \((i,j)\)，初始化写 \(C[i,j]\) 后，第一次更新 \(U[i,j,0]\) 读同址且中间无写，所以

\[
\Delta_{\mathrm{init}}
=\{I[i,j]\to U[i,j,0]\mid0\le i<M\land0\le j<N\land K>0\}:D_I\to D_U.
\]

相邻更新间的精确循环携带 RAW 为

\[
\Delta_{\mathrm{red}}
=\{U[i,j,k]\to U[i,j,k+1]\mid0\le i<M\land0\le j<N\land0\le k<K-1\}:D_U\to D_U,
\]

其中 source 是 \(k\)，sink 是 \(k+1\)。\(K=0\) 时两类边都空；\(K=1\) 时只有初始化边。

<a id="ans-ex07-c02"></a>
### 参考答案 EX07-C02｜Covered 差集与 lexmax 等价

对同一地址 \(m\)，设 \(w_1\prec w_2\prec w_3\prec r\)。候选为

\[
\{w_1\to r,w_2\to r,w_3\to r\}.
\]

差集法中，\(w_1\to r\) 被 \(w_2\) 或 \(w_3\) 覆盖，\(w_2\to r\) 被 \(w_3\) 覆盖，只剩 \(w_3\to r\)。Lexmax 法对固定 \((r,m)\) 选择所有先行写中的最大事件时间，同样得到 \(w_3\)。两法都依赖完整事件序和按地址选择。

<a id="ans-ex07-c03"></a>
### 参考答案 EX07-C03｜多地址 last-write 后投影

设 \(S\) 先写 \(A[i]\) 与 \(B[i]\)，中间 \(U\) 只写 \(A[i]\)，最后 \(T\) 读两者。按 \(A[i]\) 选择，\(U\) 是 last write，得到 \(U[i]\to T[i]\)；按 \(B[i]\) 选择，中间无覆盖写，得到 \(S[i]\to T[i]\)。

先保留访问 site 与地址。记写事件为 \(u_A(i),s_B(i)\in E_W\)，读事件为 \(t_A(i),t_B(i)\in E_R\)，则 last-write 的结果是事件—地址—事件三元组

\[
\begin{aligned}
F_{\mathrm{RAW}}
={}&\{(u_A(i),A[i],t_A(i))\mid0\le i<N\}\\
&\cup\{(s_B(i),B[i],t_B(i))\mid0\le i<N\}
\subseteq E_W\times M\times E_R.
\end{aligned}
\]

令 \(\iota:E_W\cup E_R\to\biguplus_X D_X\) 抹去 access-site 身份并恢复其语句实例。它在事件三元组集合上的实例投影明确定义为

\[
\Pi_\iota(F)
=\{\iota(e_s)\to\iota(e_t)\mid
\exists m:(e_s,m,e_t)\in F\}.
\]

于是 \(\Pi_\iota(F_{\mathrm{RAW}})\) 是先按地址完成 last-write、再删去地址与 site 身份的结果，具体得到两支带类型的实例关系

\[
\begin{aligned}
\Delta^A_{U\to T}
&=\{U[i]\to T[i]\mid0\le i<N\}:D_U\to D_T,\\
\Delta^B_{S\to T}
&=\{S[i]\to T[i]\mid0\le i<N\}:D_S\to D_T.
\end{aligned}
\]

也就是说，\(\Pi_\iota(F_{\mathrm{RAW}})\) 恰含这两支。若先投影地址，只看到 \(U\) 位于 \(S,T\) 之间便删除 \(S\to T\)，会误删 \(B\) 地址上的真实 flow。

<a id="ans-ex07-c04"></a>
### 参考答案 EX07-C04｜RMW phase 与内部 WAR

对 \(N=3\) 的 `sum += A[i]`，令

\[
r_i=(i,0),\qquad w_i=(i,1).
\]

动态事件序为

\[
r_0\prec w_0\prec r_1\prec w_1\prec r_2\prec w_2.
\]

每个读事件后的第一次同址写就是本实例 \(w_i\)，所以精确 WAR 为

\[
\{r_0\to w_0,r_1\to w_1,r_2\to w_2\}.
\]

候选 \(r_i\to w_{i+1}\) 被 \(w_i\) 覆盖。这三条是语句内部 read-before-write phase 边，不要求实例调度满足不可能的 \(\theta(i)<\theta(i)\)；跨实例累积顺序由 RAW/WAW 等另行表达。

## 参考答案：第 8 章

<a id="ans-ex08-b01"></a>
### 参考答案 EX08-B01｜Shift 候选调度合法性

依赖从 source \(i\) 指向 sink \(i+1\)，故

\[
d(i)=\theta(i+1)-\theta(i).
\]

\[
\begin{array}{c|c|c}
\theta(i)&d(i)&\text{一维严格合法性}\\ \hline
2i+3&2&\text{合法}\\
-2i&-2&\text{非法}\\
7&0&\text{非法}
\end{array}
\]

常数项若只是多维前缀，仍可由后续维承载；作为完整一维调度则没有严格次序。

<a id="ans-ex08-b02"></a>
### 参考答案 EX08-B02｜Producer/consumer 常数次序

对 \(P(i)\to C(i)\)，原距离为

\[
\Theta_C(i)-\Theta_P(i)=(i,0)-(i,1)=(0,-1),
\]

首个非零分量为负，非法。只把消费者常数改为 2：

\[
\Theta_P(i)=(i,1),\qquad\Theta_C(i)=(i,2),
\]

距离变为 \((0,1)\)，严格 lex-positive。

<a id="ans-ex08-d01"></a>
### 参考答案 EX08-D01｜Lex-positive 与 permutable band

距离 \((1,-3)\) 的首个非零分量为正，所以完整二维调度合法。但 permutable band 的常用充分条件要求带内活动依赖逐分量非负，第二分量 \(-3\) 违反条件。交换两维后距离为 \((-3,1)\)，首分量为负，调度非法。因此 lex-positive 弱于带内逐分量非负。

<a id="ans-ex08-d02"></a>
### 参考答案 EX08-D02｜Residual dependence 分层

令初始关系为 \(U_0=\Delta\)。第一维给

\[
K_1=\{e\in U_0\mid d_1(e)=1\},
\qquad
U_1=\{e\in U_0\mid d_1(e)=0\}.
\]

第一维严格承载 \(K_1\)，只弱满足 \(U_1\)。第二维在 \(U_1\) 上恒为 2，所以

\[
K_2=\{e\in U_1\mid d_2(e)=2\}=U_1,
\qquad
U_2=\{e\in U_1\mid d_2(e)=0\}=\varnothing.
\]

题面没有给出实例边，不能进一步杜撰端点枚举。

<a id="ans-ex08-c01"></a>
### 参考答案 EX08-C01｜两支依赖下的 identity/interchange

第一支 \((i,j)\to(i,j+1)\) 的距离为

\[
d_{\mathrm{id}}=(0,1),\qquad d_{\mathrm{swap}}=(1,0),
\]

两者都合法。第二支 \((i,j)\to(i+1,j-2)\) 的距离为

\[
d_{\mathrm{id}}=(1,-2),\qquad d_{\mathrm{swap}}=(-2,1).
\]

Identity 对两支均合法，interchange 因第二支首分量为负而非法。不能以第一支或平均距离代替完整依赖并集。

<a id="ans-ex08-d03"></a>
### 参考答案 EX08-D03｜Stencil skew 系数下界

按本章约定，source 为 \((t-1,i+\delta)\)，sink 为 \((t,i)\)。对

\[
\Theta_k(t,i)=(t,kt+i),
\]

距离为 \((1,k-\delta)\)。当 \(\delta=-1,0,1\) 时依次为 \((1,k+1),(1,k),(1,k-1)\)。第二分量全部非负要求 \(k-1\ge0\)，故最小整数 \(k=1\)。

<a id="ans-ex08-c02"></a>
### 参考答案 EX08-C02｜Sequence 与 fusion 的性能权衡

\(N=3\) 时，分阶段顺序是

```text
P(0), P(1), P(2), C(0), C(1), C(2)
```

融合顺序是

```text
P(0), C(0), P(1), C(1), P(2), C(2)
```

两者都满足 \(P(i)\to C(i)\)。Fusion 可缩短中间值复用距离、减小工作集，却可能增加寄存器压力并妨碍每个阶段单独向量化。Sequence 可提供规则的长向量循环、批处理或异构阶段，却需要保存完整中间数组。实际选择取决于缓存、SIMD、资源、设备切换与同步成本，不存在无条件赢家。

<a id="ans-ex08-d04"></a>
### 参考答案 EX08-D04｜后续负维不推翻词典序合法性

取

\[
\Theta_S(i)=(0,i),\qquad\Theta_T(i)=(0,i+1),
\]

则 \(S(i)\to T(i)\) 的二维距离为 \((0,1)\)。再令第三维 source 为 100、sink 为 0，完整距离为

\[
(0,1,-100).
\]

词典序在第二维正值 1 处已决定 sink 更晚，第三维不再影响该边，故调度仍合法。

## 参考答案：第 9 章

<a id="ans-ex09-b01"></a>
### 参考答案 EX09-B01｜三角形上的仿射非负性

本章三角形为

\[
Q=\{(u,v)\in\mathbb R^2\mid u\ge0\land v\ge0\land3-u-v\ge0\}.
\]

点 \((3,0)\in Q\)，但

\[
f(3,0)=5-2\cdot3-0=-1<0.
\]

所以 \(f\) 并非在 \(Q\) 上处处非负，不存在证明这个假命题的非负 Farkas 乘子组。

<a id="ans-ex09-d01"></a>
### 参考答案 EX09-D01｜一维 Farkas 系数对齐

采用号向

\[
g_1(x)=x-1\ge0,
\qquad
g_2(x)=4-x\ge0.
\]

非空区间上的 affine Farkas 恒等式为

\[
ax+b=\lambda_0+\lambda_1(x-1)+\lambda_2(4-x),
\qquad
\lambda_0,\lambda_1,\lambda_2\ge0.
\]

对齐 \(x\) 与常数项得到

\[
a=\lambda_1-\lambda_2,
\qquad
b=\lambda_0-\lambda_1+4\lambda_2.
\]

<a id="ans-ex09-d02"></a>
### 参考答案 EX09-D02｜候选调度的直接检查与证书

依赖域含 \(i\ge0\) 与 \(j-i-1\ge0\)。候选 \(\theta_S(i)=0,\theta_T(j)=j\) 的严格合法性式为

\[
f(i,j)=\theta_T(j)-\theta_S(i)-1=j-1.
\]

由 \(j\ge i+1\)、\(i\ge0\) 得 \(j-1\ge i\ge0\)。Farkas 证书是

\[
j-1=1\cdot i+1\cdot(j-i-1).
\]

因此两条相应面约束的乘子取 1，\(\lambda_0=0\)，其余面乘子取 0。展开后 \(i\) 系数 \(1-1=0\)、\(j\) 系数 1、常数 \(-1\)，全部对齐。

<a id="ans-ex09-d03"></a>
### 参考答案 EX09-D03｜等式乘子的两种编码

令 \(h(i,j)=j-i-1\)。把 \(h=0\) 写成 \(h\ge0\)、\(-h\ge0\) 时，两条约束分别乘 \(\lambda_+,\lambda_-\ge0\)，贡献为

\[
\lambda_+h+\lambda_-(-h)=(\lambda_+-\lambda_-)h.
\]

令自由乘子 \(\mu=\lambda_+-\lambda_-\in\mathbb R\)，即得到 \(\mu h\)。反向地，任意自由 \(\mu\) 可取

\[
\lambda_+=\max(\mu,0),
\qquad
\lambda_-=\max(-\mu,0).
\]

所以“两条不等式加非负乘子”与“一个等式加自由乘子”等价。

<a id="ans-ex09-c01"></a>
### 参考答案 EX09-C01｜实松弛与 integer hull

对 \(P=[0,\tfrac12]\) 与 \(f(x)=-x\)，

\[
P\cap\mathbb Z=\{0\},
\]

所以整数点上 \(f(0)=0\ge0\)。但实点 \(x=1/2\) 上 \(f=-1/2<0\)，说明在实松弛上证明非负是整数正确性的充分条件，却非必要条件。

整数凸包为

\[
H=\operatorname{conv}(P\cap\mathbb Z)=\{0\}.
\]

仿射函数在 \(H\) 上非负当且仅当它在原整数点上非负：整数点凸组合上的函数值就是相应函数值的凸组合。

<a id="ans-ex09-c02"></a>
### 参考答案 EX09-C02｜同余集合的 Farkas 边界

先把整数见证保留为 lifted set：

\[
\widetilde S
=\{(x,k)\in\mathbb Z^2\mid0\le x\le10\land x=3k+1\}.
\]

原来的一维集合不是 \(\widetilde S\) 本身，而是它在 \(x\) 坐标上的投影：

\[
S=\operatorname{proj}_x(\widetilde S)
=\{x\in\mathbb Z\mid
\exists k\in\mathbb Z:\ 0\le x\le10\land x=3k+1\}.
\]

可行 \(k=0,1,2,3\)，故 \(S=\{1,4,7,10\}\)。若删除同余只保留 \([0,10]\)，整数 0、2、3、5 等都会成为伪点；对该实松弛使用普通 Farkas 至多给安全的充分条件，不能称为原同余集合上的整数精确证书。精确处理需保留整数 \(k\)、分余数支或采用整数方法。

<a id="ans-ex09-c03"></a>
### 参考答案 EX09-C03｜合法调度上的性能代理

取两个已满足 source → sink 合法性的候选：融合候选
\(\Theta_P(i)=(i,0),\ \Theta_C(i)=(i,1)\) 的依赖距离是 \((0,1)\)；阶段候选
\(\Theta_P(i)=(0,i),\ \Theta_C(i)=(1,i)\) 的依赖距离是 \((1,0)\)。把第一距离分量归一化为 \(0\le d_1\le1\)，定义有界线性代理

\[
J=d_1.
\]

最小化 \(J\) 时，融合候选得分 0、阶段候选得分 1，因此偏好较短的首维距离与局部复用；最大化同一个 \(J\) 时，两者得分仍分别为 0、1，因此偏好阶段分离。合法约束负责排除任何使真实依赖不严格词典序向前的调度，目标只在该可行域内排序候选。若没有 \(0\le d_1\le1\) 这类系数界或尺度归一化，最大化目标可能仅靠整体放大时间戳而无界；缓存、SIMD、设备批处理与同步成本也可能使代理与实测最优不一致。

<a id="ans-ex09-c04"></a>
### 参考答案 EX09-C04｜Residual 合成的顺序有限化

顺序链为：

1. 输入已知 \(U_0=\Delta\) 与第一维调度模板，建立第一维有限线性约束。
2. 求解并固定第一维系数，得到已知距离 \(d_1\)。
3. 计算 \(U_1=\{e\in U_0\mid d_1(e)=0\}\)；\(K_1=U_0\setminus U_1\) 已由第一维严格承载。
4. 只以已知 \(U_1\) 为输入，为第二维重新建立 Farkas 系统。

若第 2 步不固定，\(U_1\) 的约束矩阵含上一维未知调度系数 \(\gamma\)；下一维又为这些约束引入未知乘子 \(\lambda\)，展开出现 \(\lambda\gamma\) 的双线性积，不是普通 LP/ILP。

<a id="ans-ex09-d04"></a>
### 参考答案 EX09-D04｜空依赖分支与空真

\[
P=\{x\mid x\ge0\land-x-1\ge0\}
\]

同时要求 \(x\ge0\) 与 \(x\le-1\)，所以 \(P=\varnothing\)。命题 \(\forall x\in P:f(x)\ge0\) 对任意 \(f\) 都空真，因为没有反例点。非空版本的 affine Farkas lemma 不能机械套用；调度器应先删除空依赖分支，或把空性作为独立逻辑分支处理。

## 参考答案：第 10 章

<a id="ans-ex10-d01"></a>
### 参考答案 EX10-D01｜Fusion/fission 的完整依赖像

两类边为

\[
\begin{aligned}
\Delta_{PQ}&=\{P(i)\to Q(i)\mid0\le i<N\},\\
\Delta_{QP}&=\{Q(i)\to P(i+2)\mid0\le i<N-2\}.
\end{aligned}
\]

原融合调度 \(\Theta_P(i)=(i,0),\Theta_Q(i)=(i,1)\) 下，

\[
\begin{aligned}
P(i):(i,0)&\to Q(i):(i,1),&d_{PQ}&=(0,1),\\
Q(i):(i,1)&\to P(i+2):(i+2,0),&d_{QP}&=(2,-1).
\end{aligned}
\]

两支都 lex-positive。候选分阶段调度 \(\Theta'_P(i)=(0,i),\Theta'_Q(i)=(1,i)\) 下，

\[
d'_{PQ}=(1,0),
\qquad
d'_{QP}=(-1,2).
\]

第二支首个非零分量为负，所以 distribution/fission 非法。初始化 `state[0]`、`state[1]` 只补齐最初输入，不改变循环内边域。

<a id="ans-ex10-c01"></a>
### 参考答案 EX10-C01｜Alias 使空依赖证明失效

令 `T` 与 `A` 是同一行主序 \(N\times N\) 数组，语句为 \(S(i,j):A[j,i]=A[i,j]\)，原序为 \(i\) 外层、\(j\) 内层。对 \(0\le i<j<N\)：

- source \(S(i,j)\) 读 \(A[i,j]\)，写 \(A[j,i]\)；
- sink \(S(j,i)\) 随后读 \(A[j,i]\)，写 \(A[i,j]\)。

因此

\[
\{S(i,j)\to S(j,i)\mid0\le i<j<N\}
\]

既是 RAW（source 写 \(A[j,i]\)，sink 读），也是 WAR（source 读 \(A[i,j]\)，sink 写）。写映射对实例仍是单射，因此不同实例间没有 WAW。Out-of-place 例的空依赖结论依赖 `A` 与 `T` 不别名；仅知道“可能别名”而没有具体布局时，只能给保守候选，不能列出唯一精确边。

<a id="ans-ex10-d02"></a>
### 参考答案 EX10-D02｜Stencil skew 与交换

原三支距离为 \((1,-2),(1,0),(1,1)\)。变换 \((t,i)\mapsto(t,kt+i)\) 后得到

\[
(1,k-2),\quad(1,k),\quad(1,k+1).
\]

逐分量非负要求 \(k\ge2\)，故最小整数 \(k=2\)，三支变为 \((1,0),(1,2),(1,3)\)。交换两维后是 \((0,1),(2,1),(3,1)\)：第一支不由新第一维严格承载，但第二维为正，所以完整调度对三支仍 lex-positive。

<a id="ans-ex10-b01"></a>
### 参考答案 EX10-B01｜Tile/point 时间戳与恢复

对 \((i,j)=(4,3)\)、\((B_i,B_j)=(2,3)\)，Euclidean 商余为

\[
q_i=\left\lfloor\frac42\right\rfloor=2,
\quad r_i=4-2\cdot2=0,
\qquad
q_j=\left\lfloor\frac33\right\rfloor=1,
\quad r_j=3-3\cdot1=0.
\]

完整时间戳为 \((q_i,q_j,r_i,r_j)=(2,1,0,0)\)。由 \(i=B_iq_i+r_i=4\)、\(j=B_jq_j+r_j=3\) 恢复原点；余数范围保证唯一性。

<a id="ans-ex10-d03"></a>
### 参考答案 EX10-D03｜Tiled 矩阵乘的归约距离

相邻归约边为 source \(U(i,j,k)\) 到 sink \(U(i,j,k+1)\)。在调度

\[
\left(
\left\lfloor\frac{i}{B_i}\right\rfloor,
\left\lfloor\frac{j}{B_j}\right\rfloor,
k,
i\bmod B_i,
j\bmod B_j
\right)
\]

下，距离为 \((0,0,1,0,0)\)，严格 lex-positive。合法性不保证加速；仍需评价 \(k\) 连续性、A/B/C 复用、缓存容量、向量化、归约压力与并行粒度。

<a id="ans-ex10-b02"></a>
### 参考答案 EX10-B02｜Schedule tree 结构

```text
domain {P(i); Q(i)}
└── sequence
    ├── filter {P(i)}
    │   └── band [i]
    │       └── leaf
    └── filter {Q(i)}
        └── band [i]
            └── leaf
```

`sequence` 按孩子位置施加“所有 P 先于所有 Q”的跨语句次序；`filter` 只筛选实例，不自行增加时间先后；`band` 规定各分支内部的 \(i\) 次序。把 `sequence` 换成 `set` 也不会自动证明并行安全。

<a id="ans-ex10-c02"></a>
### 参考答案 EX10-C02｜浮点归约的反结合例

取单精度数量级

\[
a=10^{20},\qquad b=-10^{20},\qquad c=3.14.
\]

在通常 round-to-nearest 下，\(a+b=0\)，故 \((a+b)+c\approx3.14\)。而 \(c\) 远小于 \(b\) 在该数量级的一个 ULP，\(b+c\) 会舍入回 \(b\)，于是 \(a+(b+c)=0\)。私有化和树形合并改变括号结构，因此即使依赖意义上合法，常规 IEEE 语义也不保证逐位相同；需要 fast-math、容差或可重现归约等显式契约。

<a id="ans-ex10-d04"></a>
### 参考答案 EX10-D04｜非单射调度与严格合法性

取真实边 \(S(0)\to S(1)\)，完整一维候选 \(\theta(i)=0\) 把 source 与 sink 都映到 0，距离为 0，不满足严格词典序。问题不在“非单射”本身，而在该真实边没有任何维承载。

增加后续维 \(\Theta(i)=(0,i)\) 后，距离为 \((0,1)\)；也可把两端置于有序 `sequence` 子树。只要完整调度的某个首个非零分量为正，就可以在较早维同值。

## 参考答案：第 11 章

<a id="ans-ex11-b01"></a>
### 参考答案 EX11-B01｜三角域 identity 扫描

由 \(0\le i<N\) 与 \(i\le j<N\) 得

```c
for (int i = 0; i < N; ++i)
  for (int j = i; j < N; ++j)
    S(i, j);
```

\(N=4\) 时点集为

\[
\begin{aligned}
&(0,0),(0,1),(0,2),(0,3),\\
&(1,1),(1,2),(1,3),\\
&(2,2),(2,3),\\
&(3,3),
\end{aligned}
\]

共 \(4+3+2+1=10\) 点。覆盖性：任意域点的 \(i\) 落入外层、\(j\) 落入该内层区间。唯一性：循环计数器对唯一确定 \((i,j)\)，每个点只生成一次。

<a id="ans-ex11-d01"></a>
### 参考答案 EX11-D01｜负数同余域的 stride

用 Euclidean 商写 \(i=1+3q\)。边界给

\[
-5\le1+3q<5
\iff -2\le q<\frac43.
\]

所以 \(q=-2,-1,0,1\)，对应 \(i=-5,-2,1,4\)。可生成：

```c
for (int q = -2; q <= 1; ++q) {
  int i = 1 + 3 * q;
  S(i);
}
```

C/C++ 截余数随被除数带符号，`-5 % 3` 与 `-2 % 3` 都不是 1，因此 guard `i % 3 == 1` 会漏掉 \(-5,-2\) 两个点。它不能直接充当 Euclidean 同余判定。

<a id="ans-ex11-b02"></a>
### 参考答案 EX11-B02｜非幺模调度像扫描

\(0\le i<4\)、\(t=3i\) 的精确调度像为 \(\{0,3,6,9\}\)。Stride 版本为

```c
for (int t = 0; t <= 9; t += 3)
  S(t / 3);
```

包络加 guard 版本为

```c
for (int t = 0; t <= 9; ++t)
  if (t % 3 == 0)
    S(t / 3);
```

只有 stride 或整除 guard 保证 \(t\) 可被 3 整除后，\(i=t/3\) 才是精确恢复；无 guard 扫描会制造无原像时间点。

<a id="ans-ex11-d02"></a>
### 参考答案 EX11-D02｜负左边界的 tile floor

对 \(L=-2,N=5,B=3\)，数学 floor 给

\[
ii_{\min}=\left\lfloor\frac{-2}{3}\right\rfloor=-1,
\qquad
ii_{\max}=\left\lfloor\frac{4}{3}\right\rfloor=1.
\]

\[
\begin{array}{c|c}
ii&\text{点}\\ \hline
-1&-2,-1\\
0&0,1,2\\
1&3,4
\end{array}
\]

C 表达式 `L/B` 向 0 截断为 0，会错误地漏掉 \(ii=-1\) tile 及点 \(-2,-1\)。

<a id="ans-ex11-d03"></a>
### 参考答案 EX11-D03｜二维边缘 tile 枚举

对 \(0\le i<3,0\le j<5\) 做 \(2\times3\) tiling：

\[
\begin{array}{c|l|c}
(q_i,q_j)&\text{点}&\text{点数}\\ \hline
(0,0)&i\in\{0,1\},\ j\in\{0,1,2\}&6\\
(0,1)&i\in\{0,1\},\ j\in\{3,4\}&4\\
(1,0)&i=2,\ j\in\{0,1,2\}&3\\
(1,1)&i=2,\ j\in\{3,4\}&2
\end{array}
\]

总数 \(6+4+3+2=15=3\cdot5\)。恢复式

\[
i=2q_i+r_i,\ 0\le r_i<2;
\qquad
j=3q_j+r_j,\ 0\le r_j<3
\]

具有唯一 Euclidean 商余，所以 tile 编号和点内坐标共同唯一确定原点；边缘 tile 只是合法余数取值变少。

<a id="ans-ex11-d04"></a>
### 参考答案 EX11-D04｜Ceil/max 与 floor 边界

三条约束分别给

\[
j\ge\left\lceil\frac{i-2}{3}\right\rceil,
\qquad
j\le\left\lfloor\frac{N+i}{2}\right\rfloor,
\qquad
j\ge0.
\]

所以

\[
j_{\mathrm{lo}}=\max\left(0,\left\lceil\frac{i-2}{3}\right\rceil\right),
\qquad
j_{\mathrm{hi}}=\left\lfloor\frac{N+i}{2}\right\rfloor.
\]

闭区间内层仅当 \(j_{\mathrm{lo}}\le j_{\mathrm{hi}}\) 时非空；半开循环可写 `j < j_hi + 1`。

<a id="ans-ex11-c01"></a>
### 参考答案 EX11-C01｜Fourier–Motzkin 的整数缺口

把 \(x=3y+1\) 拆成

\[
x-3y-1\le0,
\qquad
-x+3y+1\le0.
\]

对任意实数 \(x\)，取 \(y=(x-1)/3\)，所以实 Fourier–Motzkin 投影是 \(\mathbb R\)。若 \(x,y\in\mathbb Z\)，精确投影为

\[
\{x\in\mathbb Z\mid x\equiv1\pmod3\}.
\]

有界扫描应把起点对齐到余数 1 后取 stride 3，或用 Euclidean guard \((x-1)\bmod3=0\)。实消元后的 floor/ceil 不能自动恢复同余。

<a id="ans-ex11-b03"></a>
### 参考答案 EX11-B03｜Schedule-tree context 与 AST build context

Schedule-tree `context` 是树节点，在其子树下增加已知参数或外层 band 约束，例如 \(N\ge1\land B=32\)。`isl_ast_build_from_context(set)` 的集合则在创建 AST build 时提供初始外部参数事实，例如 \(N\equiv0\pmod4\land M\ge N\)；它不是树节点。

两者都可携带参数事实，但所有权和生命周期不同，不能把 build 的参数集叫作树中节点，也不能假设树节点自动包含所有调用现场事实。

<a id="ans-ex11-c02"></a>
### 参考答案 EX11-C02｜参数分段与代码体积

取 \(N>0,P\ge0\)，扫描

\[
\max(0,P-N)\le i<\min(P,N).
\]

保留 `max/min` 只需一份循环。完全分段可写成

\[
\begin{array}{c|c}
\text{参数区}&i\text{ 的范围}\\ \hline
0\le P\le N&0\le i<P\\
N<P<2N&P-N\le i<N\\
P\ge2N&\varnothing
\end{array}
\]

三支覆盖 \(P\ge0\) 且互不重叠。单体版本减小代码体积，却保留动态 `min/max`；分段可常量化边界并删空支，却增加参数分支、代码尺寸和编译时间。热区参数稳定且专门化收益大时可偏好分段，指令缓存紧张或参数很多时可偏好单体版本。

<a id="ans-ex11-c03"></a>
### 参考答案 EX11-C03｜动态 user 事件的四项审计

令包络坐标 \(\ell\in L\)，guard 为 \(g(\ell)\)，两个静态节点为 \(u_P,u_Q\)。实际动态事件集为

\[
E=\{(u_P,\ell),(u_Q,\ell)\mid\ell\in L\land g(\ell)\}.
\]

Guard 为假时该 \(\ell\) 不产生事件；同一 \(\ell\) 的两个事件由静态 `user` 身份区分，并有 \((u_P,\ell)\prec(u_Q,\ell)\)。令恢复映射 \(\rho(u,\ell)\) 给出带语句身份的原实例，则：

1. **覆盖：** \(\rho[E]=\biguplus_u D_u\)。
2. **唯一：** 对每个原实例 \(d\)，\(|\rho^{-1}[\{d\}]|=1\)。
3. **依赖次序：** 对每条 source → sink 依赖 \(d_s\to d_t\)，其唯一事件 \(e_s,e_t\) 满足动态序 \(e_s\prec e_t\)。
4. **实参恢复：** 每个 `user` 实参 \(\operatorname{args}_u(\ell)\) 等于 \(\rho(u,\ell)\) 的原实例坐标，代入访问关系得到原语句的同一内存位置。

覆盖与唯一给出点集双射，不能替代第 3 项的顺序证明。

## 参考答案：第 12 章

<a id="ans-ex12-b01"></a>
### 参考答案 EX12-B01｜小规模域、RAW 与 live-in

取 \(T=2,N=5\)，域为

\[
D_S=\{S[1,1],S[1,2],S[1,3],S[2,1],S[2,2],S[2,3]\}.
\]

三支精确 source → sink RAW 为

\[
\begin{aligned}
\Delta_{-1}&=\{S[1,1]\to S[2,2],S[1,2]\to S[2,3]\},\\
\Delta_0&=\{S[1,1]\to S[2,1],S[1,2]\to S[2,2],S[1,3]\to S[2,3]\},\\
\Delta_{+1}&=\{S[1,2]\to S[2,1],S[1,3]\to S[2,2]\}.
\end{aligned}
\]

共 \(2+3+2=7\) 条。去重 live-in 为

\[
\{A[0,0],A[0,1],A[0,2],A[0,3],A[0,4],A[1,0],A[1,4]\},
\]

即第 0 行五点加第 1 行两侧边界，共 7 个位置。逐支列出的 source 与 sink 空间坐标均落在 \(1\le i<N-1\) 内。

<a id="ans-ex12-d01"></a>
### 参考答案 EX12-D01｜一般 skew 的距离与下界

对 \(\Theta_k(t,i)=(t,kt+i)\)，三支距离为

\[
\begin{array}{c|c}
\text{source}\to\text{sink}&\Theta_k(\text{sink})-\Theta_k(\text{source})\\ \hline
S(\tau,j)\to S(\tau+1,j+1)&(1,k+1)\\
S(\tau,j)\to S(\tau+1,j)&(1,k)\\
S(\tau,j)\to S(\tau+1,j-1)&(1,k-1)
\end{array}
\]

第二分量全部非负当且仅当 \(k\ge1\)，故最小整数 \(k=1\)。\(k=0\) 时距离为 \((1,1),(1,0),(1,-1)\)，首分量仍全为正，所以原调度保持词典序合法；\(k=1\) 是构造逐分量非负 band 的要求，不是原合法性的必要条件。

<a id="ans-ex12-c01"></a>
### 参考答案 EX12-C01｜Tile、wavefront 与点数全枚举

\(T=4,N=5\) 时每层 \(i=1,2,3\)，共 12 点。定义

\[
q_x=\left\lfloor\frac{t-1}{3}\right\rfloor,
\qquad
q_y=\left\lfloor\frac{t+i-2}{2}\right\rfloor,
\qquad
w=q_x+q_y.
\]

\[
\begin{array}{c|c|l|c}
(q_x,q_y)&w&\text{原坐标 }(t,i)&\text{点数}\\ \hline
(0,0)&0&(1,1),(1,2),(2,1)&3\\
(0,1)&1&(1,3),(2,2),(2,3),(3,1),(3,2)&5\\
(0,2)&2&(3,3)&1\\
(1,1)&2&(4,1)&1\\
(1,2)&3&(4,2),(4,3)&2
\end{array}
\]

总数 \(3+5+1+1+2=12\)，与原域点数相同；Euclidean 商定义使每点只落入一个 tile，因此不漏不重。只有 \(w=2\) 含两个 tile。若有同 wavefront 跨 tile RAW，skew 后 tile 坐标应逐分量非减且至少一维严格增，使 \(w\) 严格增，矛盾；枚举中 \(S(3,3)\) 只流向 \(w=3\)，\(S(4,1)\) 无下一时间层。

<a id="ans-ex12-d02"></a>
### 参考答案 EX12-D02｜精确 y 边界与删项反例

固定 \(x=t\) 与 \(y\)-tile \(q_y\)。斜带和 tile 分别给

\[
x+1\le y\le x+N-2,
\qquad
2+B_yq_y\le y\le1+B_y(q_y+1).
\]

所以

\[
\boxed{
y_{\mathrm{lo}}=\max(x+1,2+B_yq_y),
\qquad
y_{\mathrm{hi}}=\min(x+N-2,1+B_y(q_y+1))
}
\]

且只在 \(y_{\mathrm{lo}}\le y_{\mathrm{hi}}\) 时执行。取 \(B_y=2,N=5\)：

- 删 \(x+1\)：\(x=4,q_y=1\) 会允许 \(y=4\)，即 \(i=0\)，越出域。
- 删 \(2+B_yq_y\)：\(x=1,q_y=1\) 会把属于 \(q_y=0\) 的 \(y=2,3\) 重复放入本 tile。
- 删 \(x+N-2\)：\(x=1,q_y=2\) 会允许 \(y=6,7\)，超过域上界 4。
- 删 \(1+B_y(q_y+1)\)：\(x=1,q_y=0\) 会允许属于 \(q_y=1\) 的 \(y=4\)。

<a id="ans-ex12-c02"></a>
### 参考答案 EX12-C02｜滚动缓冲的新访问与潜在 hazard

物理位置写成 \(A[b,v]\)，其中 \(b\in\{0,1\}\)。访问关系为

\[
\begin{aligned}
W={}&\{S[t,i]\to A[b,v]\mid[t,i]\in D_S\land0\le b<2
\land b\equiv t\pmod2\land v=i\},\\
R_\delta={}&\{S[t,i]\to A[b,v]\mid[t,i]\in D_S\land0\le b<2
\land b\equiv t-1\pmod2\land v=i+\delta\},
\quad\delta\in\{-1,0,1\}.
\end{aligned}
\]

物理行每两步复用，产生 source → sink WAW 候选

\[
\Delta_{\mathrm{WAW}}^{\mathrm{roll}}
=\{S[t,i]\to S[t+2,i]\mid1\le t\le T-2\land1\le i\le N-2\},
\]

以及每个读 site 的 WAR 候选

\[
\Delta_{\mathrm{WAR},\delta}^{\mathrm{roll}}
=\{S[t,i]\to S[t+1,i+\delta]\mid
1\le t\le T-1\land1\le i\le N-2\land1\le i+\delta\le N-2\}.
\]

WAR 的 source 先读物理行 \((t-1)\bmod2\)，sink 随后因 \((t+1)\bmod2=(t-1)\bmod2\) 覆盖同址。边界读若没有域内后续写，不进入该支。变换前还需把这些候选与原 RAW 一起按事件序和 last/next-write 精确化，不能沿用完整二维数组的并行结论。

<a id="glossary"></a>
## 术语与符号速查

下表中的“对象边界”用于提醒相邻概念不可互换；公式中的实例坐标、调度时间与内存下标均取整数。

| 术语或符号 | 定义 | 直觉与编译器用途 | 对象边界 |
|---|---|---|---|
| 仿射表达式（affine expression） | \(a_0+\sum_i a_ix_i\)，系数是固定整数或有理数 | 表示域界、数组下标和调度分量 | `2*i+N` 可；一般变量乘积 `N*i` 不可 |
| 准仿射表达式（quasi-affine expression） | 在仿射式外允许固定正分母的 floor/ceil 和 Euclidean mod 等受控运算 | 表示 strip-mining、tile 坐标和整数边界 | 固定 tile 大小可；两个符号变量相乘仍不可 |
| 准多项式（quasi-polynomial） | 在参数的各个余数类或更一般的周期格上分别等于一个多项式的函数 | 表示参数化整数点计数或代价，例如偶/奇 \(N\) 使用不同多项式 | 它是计数/值函数，不是准仿射坐标映射的同义词 |
| Presburger 算术 | 含加法、序、固定整数倍、布尔连接词和量词的一阶整数算术 | 为整数域、关系和判空提供可判定逻辑 | 无一般变量乘法；可判定不等于总是计算便宜 |
| Presburger 集/关系 | 由 Presburger 公式定义的命名整数 tuple 集或 tuple 间关系 | 统一表示迭代域、访问、依赖和调度 | 自由变量决定维数；量化变量不出现在输出 tuple |
| 线性集 | \(L(b;p_1,\ldots,p_k)=\{b+\sum_r n_rp_r\mid n_r\in\mathbb N\}\) | 用基点和有限周期生成无限离散集 | 非负的是系数，不是向量子空间 |
| 半线性集（semilinear set） | 有限多个线性集之并 | 描述 Presburger 集的周期结构 | 可有无限孔洞，不等于单个凸多面体格点集 |
| 有理凸多面体（polyhedron） | 有限个有理线性等式/不等式的实解集 \(P\subseteq\mathbb R^d\) | 几何化约束，支持投影、凸优化和 Farkas 证书 | \(P\) 是连续对象，不是循环整数实例本身 |
| 多面体整数点集 | \(P\cap\mathbb Z^d\) | 把连续多面体限制到可执行的整数实例 | 与 \(P\)、integer hull 及一般 Presburger 集都不同 |
| 整数凸包（integer hull） | \(\operatorname{conv}(P\cap\mathbb Z^d)\) | 用连续凸集精确承载整数点上的仿射非负性 | 它仍是连续凸集，不是原离散点集 |
| 投影（projection） | \(\operatorname{proj}_I(X)=\{x_I\mid\exists x_{\bar I}:(x_I,x_{\bar I})\in X\}\)，即保留坐标 \(I\) 并对其余坐标作存在量化 | 忘掉坐标，相当于存在量词消去 | 整数投影可能保留同余；不能直接用实包络替代 |
| 严格词典序（strict lexicographic order） | 两向量不等时，由首个不同分量决定大小；该分量较小者严格在前 | 定义多维调度先后及 lexmin/lexmax | 后续负分量不会推翻更早的正分量；完全相等不构成严格在前 |
| SCoP | 控制和内存访问可由静态仿射/Presburger 对象精确描述的程序区域 | 是经典多面体优化的输入边界 | 数据依赖分支、间接访问和隐藏副作用通常越界 |
| 参数向量 \(p\) | 编译时符号化、执行中只读的整数，例如 \((T,N)\) | 参数化同一族域和调度 | 参数不是语句实例 tuple 坐标 |
| 参数上下文 \(C(p)\) | 只约束参数的公式，例如 \(T\ge1\land N\ge3\) | 限定所有后续对象的合法参数区 | 与 schedule-tree context、AST build context 分层不同 |
| 迭代域 \(D_S(p)\) | 静态语句 \(S\) 的全部动态实例集合 | 把一次源语句的执行命名为整数点 | Tuple 名 \(S\) 是 identity；\(S[i]\) 与 \(T[i]\) 不同 |
| 抽象内存空间 \(M\) | 由数组名和下标 tuple 区分的逻辑位置集合 | 为别名和同址分析提供共同中间空间 | 物理别名假设必须显式进入模型 |
| 读/写访问 \(R_S,W_S\) | \(D_S\to M\)，从语句实例映到读取或写入位置 | 连接程序实例与内存，构造同址候选 | 方向恒为 instance → memory |
| 原始事件序 | 顺序程序中读写事件的动态先后，含语句内 phase | 过滤逆序候选并定义 last/next-write | 实例级调度未必能区分同一 RMW 的读和写 |
| 同址候选 | 由访问及逆关系复合得到的共享地址实例对 | 是依赖分析的候选起点 | 尚未加入原序和覆盖写，不能称精确依赖 |
| 依赖 \(\Delta_{S\to T}\) | \(D_S\to D_T\)，source 实例必须先于 sink 实例 | 规定任何合法变换必须保持的因果顺序 | 第一 tuple 永远是 source，第二 tuple 是 sink |
| RAW / flow | Source 写、sink 读同址，source 是 sink 前最后写 | 表示值从 producer 流向 consumer | 候选写读冲突还要做 last-write |
| WAR / anti | Source 读、sink 随后写同址，sink 是 source 后第一次相关写 | 防止后写过早覆盖尚未完成的读 | RMW 内部 read → write 常属于 phase 边 |
| WAW / output | Source 写、sink 随后写同址，通常保留 next-write 链 | 保持最终写入次序 | 连续四写精确链只有三条相邻边 |
| Live-in | 被域内实例读取、却没有域内先行 producer 的内存位置 | 描述区域外必须提供的输入边界 | 是内存位置集，不等于“第一轮所有读”的粗略说法 |
| 精确依赖 | 同址候选结合原序和 last/next-write 后的关系 | 为调度合法性提供真实约束 | 按地址选择完成前不能投影掉地址 |
| 调度 \(\Theta_S\) | \(D_S\to\mathbb Z^k\)，把实例映到有序时间戳 | 用统一时间空间表达循环变换 | 合法调度不要求全局单射，但每条真实边必须严格向前 |
| 调度距离 | \(d=\Theta_T(y)-\Theta_S(x)\) | 直接检查 source → sink 的词典序符号 | 本教程始终是 sink 减 source，不得交换 |
| Schedule map | 带语句身份的实例到 schedule space 的扁平映射/关系 | 便于计算依赖像与按时间扫描 | 不自然保留分支、band 和 tiling 结构 |
| Schedule tree | 由 domain、context、sequence/set、filter、band 等节点组成的结构化调度 | 保留语句组织、层次和 band 属性 | 是工具表示，不是 Presburger 算术新运算 |
| Band | Schedule tree 中组织一组连续调度维的节点 | 表示可整体变换、tiling 或标注的一组维 | 一个 band 不机械对应一个 AST 循环 |
| Permutable band | 允许带内维交换的 band；常用充分条件是活动依赖逐分量非负 | 为 interchange 和矩形 tiling 提供结构入口 | 完整距离 lex-positive 不足以推出可置换 |
| Coincident 维 | 对相关依赖无需承载顺序、可作为并行候选的调度维 | 帮助标注潜在并行循环 | 仍要检查归约、同步、别名和资源约束 |
| Residual relation \(U_r\) | 前 \(r\) 维距离均为 0、尚未严格承载的依赖子集 | 逐维构造多维调度 | 下一维建模前必须先固定上一维并算出 \(U_r\) |
| 仿射 Farkas 引理（affine Farkas lemma） | 在非空实/有理多面体上，仿射式处处非负当且仅当它可写成非负面约束乘子与非负常数生成元 \(\lambda_0\) 的组合 | 把全称合法性有限化为有限的系数约束 | 等价针对该实/有理多面体；用于整数域的实松弛时通常只给安全充分条件，整数精确性需在 integer hull 上应用或另用整数方法 |
| Strip-mining | 用 Euclidean 商余把一维拆为块号与块内位置 | 构造固定大小分块 | Floor/mod 是准仿射，不是普通仿射矩阵 |
| Tiling | 对一个 band 的多维坐标做 strip-mining 并组织 tile/point 次序 | 改善局部性、并行粒度或通信 | 负坐标需数学 floor/mod；性能收益不必然 |
| AST | 从域与调度扫描得到的 `for`、`if`、`block`、`mark`、`user` 节点树 | 把变换顺序恢复为目标控制结构 | 生成成功不自动证明语义保持 |
| 动态 `user` 事件 \(E(p)\) | 参数 \(p\) 下实际到达的 `(user 身份, 外围迭代值)` 事件 | 通过恢复映射与原实例域建立点集双射 | Guard-false 循环迭代不进入 \(E\)；同一循环 tuple 可有多个 `user` |
| 恢复映射 \(\rho\) | \(E(p)\to\biguplus_S D_S(p)\) | 把生成 AST 事件还原为原语句实例 | 双射只证明不漏不重，依赖次序另行检查 |
| Stride / guard | Stride 只枚举某余数类；guard 在整数包络内筛成员 | 恢复同余、整除和分段条件 | 负数时 C `%` 不能未经规范化代替 Euclidean modulo |
| Floor / ceil 边界 | \(z\ge a/q\) 取 \(\lceil a/q\rceil\)，\(z\le b/q\) 取 \(\lfloor b/q\rfloor\)，\(q>0\) | 把有理界收紧成精确整数循环界 | 负数时数学 floor/ceil 不等于 C 向 0 截断 `/` |

<a id="relation-cheatsheet"></a>
## 关系运算速查

记 \(\operatorname{Rel}(X,Y)=2^{X\times Y}\)，并设 \(R,S\in\operatorname{Rel}(X,Y)\)、\(Q\in\operatorname{Rel}(Y,Z)\)。补集总是相对于显式 universe。复合固定为先走 \(R\)、再走 \(Q\)。

| 运算 | 类型签名 | 逻辑定义 | 几何直觉 | 编译器用途 | 微型例子 |
|---|---|---|---|---|---|
| Union \(R\cup S\) | \(\operatorname{Rel}(X,Y)^2\to\operatorname{Rel}(X,Y)\) | \((R\cup S)(x,y)\iff R(x,y)\lor S(x,y)\) | 合并两个分支 | 合并多个读 site、语句或依赖分支 | \(\{0\to a\}\cup\{1\to b\}=\{0\to a,1\to b\}\) |
| Intersection \(R\cap S\) | 同上 | \((R\cap S)(x,y)\iff R(x,y)\land S(x,y)\) | 同时施加两组条件 | 候选与原序、上下文或坏集相交 | \(\{0\to a,1\to b\}\cap\{1\to b,2\to c\}=\{1\to b\}\) |
| Difference \(R\setminus S\) | 同上 | \((R\setminus S)(x,y)\iff R(x,y)\land\neg S(x,y)\) | 从一组边删除另一组 | `Candidate \ Covered`、删除已承载依赖 | \(\{0\to a,1\to b\}\setminus\{1\to b\}=\{0\to a\}\) |
| Complement \(c_U(R)=U\setminus R\) | 固定 \(U\subseteq X\times Y\) 时，\(c_U:2^U\to2^U,\ R\mapsto U\setminus R\) | \((U\setminus R)(x,y)\iff U(x,y)\land\neg R(x,y)\) | 在给定全集内取反 | 构造调度坏集或 guard 的补支 | \(U=\{0,1\}\times\{a,b\}\)、\(R=\{0\to a,1\to b\}\) 时补集为 \(\{0\to b,1\to a\}\) |
| Projection \(\pi_{X,Y}\) | \(2^{X\times Y\times Z}\to2^{X\times Y}\) | \(\pi_{X,Y}(A)=\{(x,y)\mid\exists z:(x,y,z)\in A\}\) | 忘掉坐标 | 消去地址、辅助商或 tile 内坐标 | \(\{(0,a,7),(0,b,8)\}\) 投影前两维得 \(\{(0,a),(0,b)\}\) |
| Domain \(\operatorname{domain}(R)\) | \(\operatorname{Rel}(X,Y)\to2^X\) | \(\{x\mid\exists y:R(x,y)\}\) | 有至少一个输出的输入 | 求有访问或有后继的实例 | \(R=\{0\to a,2\to b\}\) 的 domain 为 \(\{0,2\}\) |
| Range \(\operatorname{range}(R)\) | \(\operatorname{Rel}(X,Y)\to2^Y\) | \(\{y\mid\exists x:R(x,y)\}\) | 可由某输入到达的输出 | 求访问地址集或调度像 | 上例 range 为 \(\{a,b\}\) |
| Inverse \(R^{-1}\) | \(\operatorname{Rel}(X,Y)\to\operatorname{Rel}(Y,X)\) | \(R^{-1}(y,x)\iff R(x,y)\) | 把每条边反向 | 从内存位置回到读/写实例 | \(\{0\to a,2\to b\}^{-1}=\{a\to0,b\to2\}\) |
| Composition \(Q\circ R\) | \(\operatorname{Rel}(Y,Z)\times\operatorname{Rel}(X,Y)\to\operatorname{Rel}(X,Z)\) | \((Q\circ R)(x,z)\iff\exists y:R(x,y)\land Q(y,z)\) | 先走 \(R\)，再走 \(Q\) | 写实例 → 内存 → 读实例；映射依赖到时间 | \(R=\{0\to a\}\)、\(Q=\{a\to10\}\) 得 \(Q\circ R=\{0\to10\}\) |
| Image \(R[A]\) | \(\operatorname{Rel}(X,Y)\times2^X\to2^Y\) | \(R[A]=\{y\mid\exists x\in A:R(x,y)\}\) | 把输入集合沿关系向前送 | 求实例子集的访问地址或调度像 | 对 \(R=\{0\to a,1\to b\}\)、\(A=\{1\}\)，像为 \(\{b\}\) |
| Preimage \(R^{-1}[B]\) | \(\operatorname{Rel}(X,Y)\times2^Y\to2^X\) | \(R^{-1}[B]=\{x\mid\exists y\in B:R(x,y)\}\) | 找会落入目标集的输入 | 把地址集或 guard 拉回实例域 | 对上例 \(B=\{b\}\)，preimage 为 \(\{1\}\)；这里是集合运算，不是把结果当成 inverse relation |
| Lexmin \(\operatorname{lexmin}(R)\) | \(\operatorname{Rel}(X,Y)\to\operatorname{Rel}(X,Y)\) | 对 fiber \(R(x)=\{y\mid R(x,y)\}\)，仅当它非空且存在达到的 lex 最小元 \(y_*\) 时保留 \((x,y_*)\) | 每个输入选最早输出 | 选择最早事件或规范扫描代表 | \(p\to\{(0,2),(0,1)\}\) 选 \(p\to(0,1)\)；空 fiber 不产边，\(\{(0,n)\mid n\in\mathbb Z\}\) 无 lexmin |
| Lexmax \(\operatorname{lexmax}(R)\) | 同上 | 仅当 fiber 非空且存在达到的 lex 最大元 \(y^*\) 时保留 \((x,y^*)\) | 每个输入选最后输出 | 对 `(sink,address)` 选此前最后写 | 同一有限 fiber 选 \(p\to(0,2)\)；空 fiber 不产边，向上无界 fiber 无 lexmax |

对整数 fiber，有限性足以保证 lexmin/lexmax 存在；更一般时必须检查相应极值确实达到。逐坐标下界可保证 lexmin 的递归选择，逐坐标上界可保证 lexmax；仅有一个粗糙的词典序下界并不充分，例如 \(\{(0,n)\mid n\in\mathbb Z\}\) 没有 lex 最小元。

三个高频类型链是

\[
\begin{aligned}
W_S:D_S\to M,\quad R_T^{-1}:M\to D_T
&\Longrightarrow R_T^{-1}\circ W_S:D_S\to D_T,\\
\Theta_S^{-1}:\mathbb Z^k\to D_S,\quad
\Delta:D_S\to D_T,\quad
\Theta_T:D_T\to\mathbb Z^k
&\Longrightarrow
\Theta_T\circ\Delta\circ\Theta_S^{-1}:\mathbb Z^k\to\mathbb Z^k,\\
R:X\to Y,\quad B\subseteq Y
&\Longrightarrow R^{-1}[B]\subseteq X.
\end{aligned}
\]

最后一行的 \(R^{-1}[B]\) 是 preimage 记号：可理解为 inverse relation \(R^{-1}\) 对 \(B\) 的 image，但“取得一组输入”与“构造整条逆关系”是两个不同操作。

<a id="further-reading"></a>
## 延伸阅读路径

### 路径一：逻辑基础——从可判定性到半线性结构

1. 先读 Presburger 1929 工作的[英文译注稳定存档](https://hdl.handle.net/1813/6478)，建立语言边界、完备性和可判定性的历史坐标。
2. 再读 Cooper 1972 的[原文扫描](https://www21.in.tum.de/teaching/logik/SS16/Exercises/Cooper.pdf)，沿“存在量词等于投影”理解整数消元为何产生整除与同余。
3. 最后读 Ginsburg–Spanier 1966 的[原文](https://msp.org/pjm/1966/16-2/pjm-v16-n2-p09-p.pdf)，核对 modified Presburger formulas 与 \(\mathbb N^d\) 半线性集的等价。

适合配做 EX02-D01/D02、EX03-D01、EX05-D02/C01/C03。阅读时必须标出论域是 \(\mathbb N\) 还是 \(\mathbb Z\)；整数版需要显式差编码等搬运，可判定性也不意味着低复杂度。

### 路径二：依赖分析——从整数判空到精确 last-write

1. 读 Pugh 的 [*The Omega Test*](https://doi.org/10.1145/125826.125848)，关注整数仿射约束的可行性、投影及编译器依赖问题。
2. 接着读 Feautrier 1991 的[*Dataflow Analysis of Array and Scalar References*](https://doi.org/10.1007/BF01407931)，把同址候选、原始顺序和 last-write/覆盖写分成不同阶段。
3. 用 EX04-C01、EX07-B01 至 EX07-C04、EX12-B01 逐条标出 source、sink、共享地址和中间写。

这条路线回答为什么 \(R_T^{-1}\circ W_S\) 只给候选、为什么删除覆盖写会恢复更早 producer。Omega 支持整数可行性检查，但不替代事件顺序和 last-write 语义。

### 路径三：自动调度——从合法仿射时间到性能目标

1. 依次读 Feautrier 1992 [Part I](https://doi.org/10.1007/BF01407835) 与 [Part II](https://doi.org/10.1007/BF01379404)，跟踪调度合法性、逐维构造和 Farkas 有限化。
2. 再读 [Pluto 项目/作者资料](https://www.ece.lsu.edu/jxr/pluto/) 与 [Pluto+](https://doi.org/10.1145/2896389)，观察并行性、局部性和工程目标怎样进入候选选择。
3. 用 EX08-C01/C02、EX09-D02/C03/C04、EX10-D01/D02/D03 重算 identity、fusion、skew 和 tile 的完整依赖像。

核心边界是：合法可行域与性能目标是两层问题；普通 Farkas 工作在实/有理多面体上，对整数实例必须声明采用实松弛的安全充分条件，或先换成 integer hull。构造 residual 时要先固定上一维。

### 路径四：代码生成——从多面体扫描到语义审计

1. 读 Quilleré–Rajopadhye–Wilde 2000 的[参数化嵌套循环生成论文](https://doi.org/10.1023/A:1007554627716)，建立扫描整数点和调度像的算法视角。
2. 再读 Bastoul 2004 的[作者公开稿](https://icps.u-strasbg.fr/~bastoul/research/papers/Bas04-PACT.pdf)，关注 CLooG 风格边界、参数分支和非简单可逆变换。
3. 最后读 [*Verified Code Generation for the Polyhedral Model*](https://xavierleroy.org/publi/polyhedral-codegen.pdf)，把“生成循环”提升为覆盖、唯一、恢复和顺序保持的证明义务。

适合配做 EX11-B01、EX11-D01/D04、EX11-C01/C03、EX12-C01/D02。需要始终区分数学 floor/mod 与目标语言除法、实投影与整数同余、schedule 维与 AST 循环。

### 路径五：isl/工具实践——用对象类型贯穿全链

1. 以 [isl 官方手册](https://libisl.sourceforge.io/manual.pdf)为主线，按 set/basic set、map、union map、schedule/schedule tree、AST build 的次序阅读对象和接口。
2. 用 EX04-D02/C01 核对 `apply_range` 的复合方向；用第 6–7 章核对 instance → memory 与 source → sink tuple 类型；用第 8–10 章核对 schedule tree；用第 11–12 章核对 AST build 和 `user` 实参。
3. 每次调用前先写数学签名。例如 `W.apply_range(R.reverse())` 的结果必须是写实例域到读实例域。

isl 手册是工具对象和 API 语义来源，不替代 Presburger、半线性、精确 flow、仿射调度或扫描正确性的原始定理。终点不是记住打印文本，而是能从程序前提一路追踪到域、访问、依赖、调度、扫描和四项 AST 审计。
