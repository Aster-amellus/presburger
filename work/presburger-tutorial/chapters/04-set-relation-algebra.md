# 第 4 章：Presburger 集合与关系代数

## 直觉

前两章把 Presburger 公式看作真假命题。本章换一个同等重要的视角：固定参数后，让自由变量遍历整数格点，满足公式的点就组成一个集合；把自由变量分成输入、输出两组，满足公式的点对就组成一个关系。于是，逻辑中的合取、析取、否定和存在量词，分别成为集合/关系的交、并、补和投影。

这种视角正是 polyhedral 编译器的接口语言。循环实例是集合，数组访问是从实例到内存位置的关系，调度是从实例到时间戳的关系或函数。分析过程不是在若干无类型的公式之间“拼字符串”，而是在带有明确源空间和目标空间的对象之间做代数运算。

本章始终采用如下方向约定：

\[
R\subseteq X\times Y
\quad\text{读作}\quad
R:X\to Y.
\]

若 \((x,y)\in R\)，则沿着关系从 \(x\) 走到 \(y\)。这只是关系的类型和方向；关系不必是单值函数，也不必覆盖整个 \(X\)。

## 形式定义

### 从自由变量到集合与关系

令 \(p\in\mathbb Z^m\) 是参数向量，\(C(p)\) 是只约束参数的上下文。若 \(\varphi(x,p)\) 是 Presburger 公式，且 \(x\in\mathbb Z^d\) 是它的一组自由变量，则它定义参数化集合

\[
S(p)=\{x\in\mathbb Z^d\mid C(p)\land\varphi(x,p)\}.
\]

若自由变量被分成 \(x\in X\subseteq\mathbb Z^d\) 与 \(y\in Y\subseteq\mathbb Z^e\) 两组，公式 \(\psi(x,y,p)\) 定义参数化关系

\[
R(p)=\{x\to y\mid C(p)\land\psi(x,y,p)\}\subseteq X\times Y.
\]

箭头左、右两侧的 tuple 空间是类型的一部分。例如，语句实例空间 \(D_S\)、内存空间 \(M\) 和时间空间 \(\mathbb Z^k\) 即使维数碰巧相同，也不能因此互换。访问关系 \(W_S:D_S\to M\) 与调度 \(\theta_S:D_S\to\mathbb Z^k\) 是不同类型的对象。

### 基本运算及其逻辑含义

设 \(A,B\subseteq X\)，\(R\subseteq X\times Y\)，\(Q\subseteq Y\times Z\)。以下定义同时给出代数运算和相应公式。

| 运算 | 形式定义 | 逻辑操作 |
|---|---|---|
| 并 | \(A\cup B=\{x\mid x\in A\lor x\in B\}\) | 析取 |
| 交 | \(A\cap B=\{x\mid x\in A\land x\in B\}\) | 合取 |
| 差 | \(A\setminus B=\{x\mid x\in A\land x\notin B\}\) | 合取与否定 |
| 相对补 | \(X\setminus A=\{x\in X\mid x\notin A\}\) | 在指定全集内否定 |
| 投影 | \(\operatorname{proj}_I(S)=\{x_I\mid\exists x_{\bar I}:x\in S\}\) | 消去其余坐标 |
| 定义域 | \(\operatorname{domain}(R)=\{x\mid\exists y:(x,y)\in R\}\) | 投影到输入 |
| 值域 | \(\operatorname{range}(R)=\{y\mid\exists x:(x,y)\in R\}\) | 投影到输出 |
| 逆关系 | \(R^{-1}=\{y\to x\mid(x,y)\in R\}\) | 交换两组自由变量 |
| 像 | \(R[A]=\{y\mid\exists x:x\in A\land(x,y)\in R\}\) | 限制输入后投影 |
| 逆像 | \(R^{-1}[B]=\{x\mid\exists y:y\in B\land(x,y)\in R\}\) | 限制输出后投影 |
| 复合 | \(Q\circ R=\{x\to z\mid\exists y:R(x,y)\land Q(y,z)\}\) | 在中间空间连接并消去 |

补集必须说明全集。\(\mathbb Z\setminus A\)、区间 \(U\setminus A\) 和参数上下文内的补集通常不同。关系的并、交、差也要求两侧具有同一类型 \(X\to Y\)；复合则要求前一关系的输出类型与后一关系的输入类型相同。

投影就是存在量化的集合语义。Cooper 的整数线性算术消元给出了消去这类量词的一条经典算法路线；但“存在等价的无量词描述”不意味着描述总是短或计算总是便宜。参见 [Cooper (1972) 原文扫描](https://www21.in.tum.de/teaching/logik/SS16/Exercises/Cooper.pdf)。

### 复合方向：数学记号与 isl `apply_range`

全文固定采用函数复合式的记法：

\[
(Q\circ R)(x,z)
\Longleftrightarrow
\exists y:\ R(x,y)\land Q(y,z).
\]

因此路径是

\[
X\xrightarrow{R}Y\xrightarrow{Q}Z,
\]

书写结果却是 \(Q\circ R\)，即“先 \(R\)，后 \(Q\)”。在 isl 的对象方法记法中，对应关系是

```text
R.apply_range(Q)  ==  Q ∘ R
```

也就是对 `R` 的输出再应用 `Q`。如果 `R : X -> Y`、`Q : Y -> Z`，结果类型为 `X -> Z`。`Q.apply_range(R)` 要求 `Q` 的输出空间能接到 `R` 的输入空间；在带命名 tuple 的模型里，它通常直接类型不匹配，即使维数碰巧相等也不能据此把方向倒过来。这里的 API 含义以 [isl 官方手册](https://libisl.sourceforge.io/manual.pdf) 为工具语义来源；数学复合的定义仍以上式为准。

访问关系给出一个之后反复使用的方向检查。若

\[
W_S:D_S\to M,
\qquad
R_T:D_T\to M,
\]

则“源实例 \(x\) 写的位置被汇实例 \(y\) 读”形成的同址候选关系是

\[
R_T^{-1}\circ W_S:D_S\to D_T.
\]

在 isl 方向中对应 `W_S.apply_range(R_T.reverse())`。它仍是 `source -> sink`。相反，\(W_S^{-1}\circ R_T:D_T\to D_S\) 得到的是其反向匹配，不能仍称为同一个 source-to-sink 依赖；而且同址候选还不是考虑执行顺序和中间覆盖后的精确 flow 依赖。

### 词典序关系

对 \(a,b\in\mathbb Z^k\)，若在第一个满足 \(a_r\ne b_r\) 的分量上有 \(a_r<b_r\)，则写作 \(a\mathrel{\mathrm{lex}<}b\)。例如

\[
(2,7)\mathrel{\mathrm{lex}<}(3,-100),
\qquad
(2,7)\not\mathrel{\mathrm{lex}<}(2,7).
\]

它本身也是 Presburger 可定义关系：对固定维数 \(k\)，把“前 \(r-1\) 个分量相等且第 \(r\) 个严格小于”在 \(r=1,\ldots,k\) 上作有限析取即可。后文的调度合法性正是比较 source 时间戳与 sink 时间戳的这一关系。

## 手算示例

### 一个关系的 domain、range、inverse 与 image

设参数上下文为 \(C(N):N\ge 0\)，并给三个 tuple 空间命名为 \(I,J,K\)。考虑

\[
R_N=\{[i]_I\to[j]_J\mid 0\le i<N\land j=2i+1\}:I\to J.
\]

它是部分函数关系。逐项消去变量可得：

\[
\begin{aligned}
\operatorname{domain}(R_N)
 &=\{[i]_I\mid 0\le i<N\},\\
\operatorname{range}(R_N)
 &=\{[j]_J\mid 1\le j<2N\land j\equiv1\pmod 2\},\\
R_N^{-1}
 &=\{[j]_J\to[i]_I\mid 0\le i<N\land j=2i+1\}.
\end{aligned}
\]

`inverse` 交换输入和输出，不是把等式机械写成允许实数除法的 \(i=(j-1)/2\)；在整数语义下必须保留“\(j\) 为奇数”这一可整除条件。

若取输入子集

\[
A_N=\{[i]_I\mid0\le i<N\land i\equiv0\pmod2\},
\]

则其像为

\[
R_N[A_N]
=\{[j]_J\mid 1\le j<2N\land j\equiv1\pmod4\}.
\]

例如 \(N=6\) 时，\(A_N=\{0,2,4\}\)，像是 \(\{1,5,9\}\)。若以整个定义域为输入，\(R_N[\operatorname{domain}(R_N)]=\operatorname{range}(R_N)\)。

再取输出集合

\[
B_N=\{[j]_J\mid 0\le j<2N\land j\ge5\}.
\]

逆像是

\[
R_N^{-1}[B_N]
=\{[i]_I\mid0\le i<N\land i\ge2\},
\]

因为约束 \(2i+1\ge5\) 在整数上等价于 \(i\ge2\)。注意 \(R_N^{-1}[B_N]\) 表示逆像；它与“先构造逆关系，再求像”是同一个集合语义。

### 并、交、差与补：区间和奇偶析取

固定全集

\[
U=\{i\in\mathbb Z\mid0\le i\le9\},
\]

并定义

\[
A=\{i\in U\mid i\le5\},
\qquad
E=\{i\in U\mid i\equiv0\pmod2\}.
\]

于是：

| 运算 | 逻辑公式 | 集合解释 |
|---|---|---|
| \(A\cup E\) | \(0\le i\le9\land(i\le5\lor i\equiv0\pmod2)\) | \(\{0,1,2,3,4,5,6,8\}\) |
| \(A\cap E\) | \(0\le i\le5\land i\equiv0\pmod2\) | \(\{0,2,4\}\) |
| \(A\setminus E\) | \(0\le i\le5\land i\not\equiv0\pmod2\) | \(\{1,3,5\}\) |
| \(U\setminus A\) | \(0\le i\le9\land i>5\) | \(\{6,7,8,9\}\) |

这也展示了析取和同余造成的非凸性。若不写全集，符号“\(\neg A\)”可能被误解为 \(\mathbb Z\setminus A\)，其结果会额外包含所有负数和大于 9 的整数。

### 三角域投影

令 \(C(N):N\ge0\)，三角域为

\[
T_N=\{(i,j)\in\mathbb Z^2\mid0\le i\le j<N\}.
\]

投影到 \(i\) 坐标：

\[
\begin{aligned}
\operatorname{proj}_{i}(T_N)
 &=\{i\in\mathbb Z\mid\exists j:\ 0\le i\le j<N\}\\
 &=\{i\in\mathbb Z\mid0\le i<N\}.
\end{aligned}
\]

第二步不是简单“删掉含 \(j\) 的不等式”。它利用了存在这样的整数 \(j\) 当且仅当 \(i<N\)，且可以取见证 \(j=i\)。投影到 \(j\) 也得到 \(\{j\mid0\le j<N\}\)，此时见证可取 \(i=0\)。当 \(N=0\) 时两者都为空，与参数上下文一致。

### 两个关系的复合

继续使用 \(R_N:I\to J\)，定义

\[
Q_N=\{[j]_J\to[k]_K\mid 1\le j<2N\land k=j-1\}:J\to K.
\]

正确复合为

\[
\begin{aligned}
Q_N\circ R_N
 &=\{[i]_I\to[k]_K\mid
   \exists j:\ 0\le i<N\land j=2i+1\\
 &\hspace{42mm}\land 1\le j<2N\land k=j-1\}\\
 &=\{[i]_I\to[k]_K\mid0\le i<N\land k=2i\}.
\end{aligned}
\]

集合解释是：从输入 \(i\) 先走到奇数 \(j=2i+1\)，再走到前一个偶数 \(k=j-1\)。类型链为 \(I\to J\to K\)，所以结果是 \(I\to K\)。在 isl 中应写 `R_N.apply_range(Q_N)`。

为了看见“关系”而非仅仅“函数”，再定义

\[
F=\{[i]_I\to[j]_J\mid j=i\lor j=i+1\},
\qquad
G=\{[j]_J\to[k]_K\mid k=j\lor k=-j\}.
\]

则

\[
G\circ F
=\{[i]_I\to[k]_K\mid
k=i\lor k=-i\lor k=i+1\lor k=-i-1\}.
\]

中间点有多个选择，输出也可有多个；复合定义中的存在量词恰好保留所有可达的 \((i,k)\) 对。

### 准仿射表达式如何落回 Presburger 关系

工程文献常把由仿射式、固定整数除法、floor、ceil 和 modulo 构成的表达式称为准仿射（quasi-affine）表达式。关键不是把 `floor` 或 `mod` 当作新的神秘原语，而是把它们展开成线性约束、同余或存在变量。

#### 固定正分母的 floor

令

\[
q=\left\lfloor\frac{i+2}{3}\right\rfloor.
\]

因为分母 3 是固定正整数，这等价于

\[
3q\le i+2<3(q+1).
\]

右侧只有加法、序和常数乘法，因此关系

\[
F=\{i\to q\mid3q\le i+2<3q+3\}
\]

是 Presburger 可定义的。负数也按数学 floor 处理：例如 \(i=-3\) 时 \((i+2)/3=-1/3\)，唯一满足不等式的整数是 \(q=-1\)。这避免了把语言实现中的“向零截断”误当 floor。

#### 固定分块大小的 ceil

令 \(B\in\mathbb Z_{>0}\) 是**预先固定的正整数常量**，例如编译时选定的块大小。则

\[
c=\left\lceil\frac{N-i}{B}\right\rceil
\]

等价于

\[
B(c-1)<N-i\le Bc,
\]

也等价于 \(c=\left\lfloor(N-i+B-1)/B\right\rfloor\)。固定 \(B\) 后，\(Bc\) 是常数乘变量，仍在 Presburger 语言内。

若把 \(B\) 与 \(c\) 都当作可变量化的自由变量，乘积 \(Bc\) 就是变量乘变量，**不再是一般 Presburger 项**。因此不能仅凭写成 `ceil((N-i)/B)` 就声称它属于核心 Presburger 算术。某个工具若接受参数化除数，必须逐项核对该工具对除数、参数上下文和局部变量的具体规则；这种工具扩展不能反过来扩大本章的数学语言。isl 对 quasi-affine 表达式和 div 的具体对象规则应以 [isl 官方手册](https://libisl.sourceforge.io/manual.pdf) 为准。

#### modulo、商余数与分段

标准余数

\[
r=i\bmod3
\]

可展开为

\[
\exists q\in\mathbb Z:\ i=3q+r\land0\le r<3.
\]

固定正模数 3 保证每个 \(i\) 恰有一个这样的 \(r\)。例如谓词 \(i\equiv1\pmod3\) 可写为 \(\exists q:i=3q+1\)。

floor 也可以借商余数看成有限分段。写 \(i=3q+r\)、\(0\le r<3\)，则

\[
\left\lfloor\frac{i+2}{3}\right\rfloor =
\begin{cases}
q,&r=0,\\
q+1,&r=1\lor r=2.
\end{cases}
\]

每个分支都是仿射等式，分支条件是有限析取与同余；所以整张图仍是 Presburger 可定义关系。更一般地，只要分支数有限、每个 guard 是 Presburger 公式、每个分支值由允许的线性关系给出，就可以把分段表达式写成这些分支关系的并。

限制必须再次强调：固定常数除法、固定常数 modulo 可以用上述方式编码；`i mod j`、`floor(i/j)` 或 `ceil(i/j)` 在 \(j\) 也是任意变量时涉及变量之间的整除或乘积，不能用上述有限线性约束直接落回一般 Presburger 公式。

## 编译器用途

1. **域的组合。** 合取添加循环边界，析取表示控制流分支，并、交和差可以组合或裁剪语句实例集合。
2. **消去局部坐标。** 投影把局部索引、商余数辅助变量或中间内存坐标存在量化；量词消去再尝试得到外部可见坐标上的描述。
3. **访问匹配。** 写访问与读访问经逆和复合得到 `source -> sink` 的同址候选；后续章节再叠加原始顺序和最后写语义。
4. **调度与变换。** 调度像把迭代域送到时间空间，逆像把时间区域拉回实例空间，词典序关系表达先后。
5. **代码生成边界。** floor、ceil、modulo 和有限分支经显式约束进入整数集合表示，最终可能成为循环边界、步长或 guard；变量除变量和间接下标则越出本章闭包。

这些操作在数学上保持 Presburger 可定义性，但代数闭包不保证工程成本低。投影可能引入大量析取和同余，关系复合可能显著增大中间表示；工具通常需要化简、分支控制和上下文约束。

## 常见误区

1. **只看维数，不看 tuple 类型。** 两个一维空间未必可复合；语句实例、数组位置和时间戳应有不同身份。
2. **把数学复合读成从左到右。** \(Q\circ R\) 是先 \(R\) 后 \(Q\)；isl 中对应 `R.apply_range(Q)`。
3. **把访问逆关系写错后仍声称方向不变。** \(R_T^{-1}\circ W_S:D_S\to D_T\) 才沿 source 写实例走到 sink 读实例。
4. **把 `inverse` 与 `preimage` 混为一谈。** 前者产生关系 \(Y\to X\)，后者以输出集合为条件产生输入集合。
5. **投影时直接删约束。** 投影要证明存在被删坐标的整数见证；整数可行性还可能产生同余条件。
6. **补集没有全集。** 补集必须相对于 \(\mathbb Z^d\)、参数上下文或另一个显式集合定义。
7. **把参数放进分母便自动称为准仿射。** 在核心 Presburger 语言中，分母应是固定正整数；符号分母与商变量相乘通常越界。
8. **把同址候选当精确依赖。** 关系代数给出候选匹配，执行顺序和中间覆盖仍需后续数据流分析。

## 练习

### 练习 EX04-B01｜Relation 的 domain/range/inverse/image（基础）

令 \(R=\{i\to j\mid0\le i<8\land j=3i+2\}\)。写出 `domain`、`range` 和 \(R^{-1}\)，并计算偶数输入集合在 \(R\) 下的像。

**答案索引：** [ANS-EX04-B01](#ans-ex04-b01)

### 练习 EX04-D01｜奇偶三角域投影（推导）

令 \(T_N=\{(i,j)\mid0\le i\le j<N\land i\equiv j\pmod2\}\)。分别投影到 \(i\) 和 \(j\)，说明参数 \(N=0\) 与 \(N=1\) 的边界情况。

**答案索引：** [ANS-EX04-D01](#ans-ex04-d01)

### 练习 EX04-D02｜三关系复合与 isl 调用顺序（推导）

给定 \(A:X\to Y\)、\(B:Y\to Z\)、\(C:Z\to W\)，写出 \(C\circ B\circ A\) 的量词公式以及连续两次 isl `apply_range` 的调用顺序。

**答案索引：** [ANS-EX04-D02](#ans-ex04-d02)

### 练习 EX04-D03｜Euclidean floor 与 modulo 展开（推导）

把 \(q=\lfloor(i-4)/5\rfloor\) 与 \(r=i\bmod5\) 分别展开成 Presburger 约束，并用 \(i=-2\) 检查 floor 和余数语义。

**答案索引：** [ANS-EX04-D03](#ans-ex04-d03)

### 练习 EX04-C01｜访问复合的类型与方向（综合）

设 \(W_S:D_S\to M\)、\(R_T:D_T\to M\)。判断 \(R_T^{-1}\circ W_S\) 和 \(W_S^{-1}\circ R_T\) 的类型与方向，并解释哪一个可作为 source 语句 \(S\) 到 sink 语句 \(T\) 的同址候选。

**答案索引：** [ANS-EX04-C01](#ans-ex04-c01)

## 本章小结

- Presburger 公式的自由整数变量给出集合；把自由变量分为输入、输出两组就给出带类型关系。
- 并、交、差、补对应布尔运算，投影对应存在量化；domain、range、像、逆像都是限制与投影的组合。
- 全文的复合约定是 \((Q\circ R)(x,z)\Leftrightarrow\exists y:R(x,y)\land Q(y,z)\)，而 isl `R.apply_range(Q)` 对应 \(Q\circ R\)。
- 访问关系必须显式取逆才能按内存位置匹配，所得依赖候选仍保持 `source -> sink`。
- 固定正整数分母的 floor、ceil、modulo 和有限分段可展开成线性约束、同余、析取与存在变量；变量除变量不属于一般 Presburger 表达式。
- 闭包说明结果仍可定义，不说明表示一定简短或计算一定高效。
