# 第 6 章：循环程序的关系建模

## 直觉

循环程序把三类事实写在一起：哪些动态语句会执行、每次执行访问哪个地址、这些执行原本按什么顺序发生。关系模型把它们拆成带类型对象：

1. 迭代域 \(D_S\) 枚举静态语句 \(S\) 的动态实例；
2. 访问关系 \(R_S,W_S:D_S\to M\) 把实例送到读、写的内存位置；
3. 调度 \(\theta_S:D_S\to\mathbb Z^k\) 把实例送到原始执行时间。

两个语句即使都用循环变量 i，也属于不同的命名 tuple 空间；同一语句的不同迭代才是同一空间中的不同整数点。内存位置也带数组标签，\(A[0]\) 与 \(B[0]\) 不会因为下标相同而混为一处。

本章只建立程序事实，不提前把“同址”称作依赖。第 7 章才会显式取访问逆关系、匹配地址，并加入原始顺序和最后写/下一写条件。所有访问始终按 **instance → memory** 读取。

## 形式定义

### 参数、实例、内存与调度

令 \(p\in\mathbb Z^q\) 为参数向量，\(C(p)\) 为只含参数的上下文。每个静态语句 \(S\) 有独立命名实例空间 \(I_S\)，其执行实例为

\[
D_S(p)=\{x\in I_S\mid\varphi_S(x,p)\}\subseteq\mathbb Z^{d_S}.
\]

完整语义在 \(C(p)\land x\in D_S(p)\) 下解释。参数不是迭代坐标：\(N\) 控制域大小，却不是实例 tuple 的分量。

抽象内存集合写成带标签的不交并

\[
M=M_A\uplus M_B\uplus M_C\uplus\cdots.
\]

数组 \(A\) 的元素记作 \(A[a_1,\ldots,a_r]\in M_A\)。若源语言允许指针别名，必须证明两个标签不相交，或保守地把潜在别名纳入同一内存模型；不同变量名本身不是无别名证明。

语句 \(S\) 的第 \(r\) 条读访问和第 \(w\) 条写访问分别是

\[
R_{S,r}:D_S\to M,\qquad W_{S,w}:D_S\to M.
\]

\((x,m)\in R_{S,r}\) 表示实例 \(x\) 读取 \(m\)。一个语句可有多条读写关系；只关心地址并集时，可取同类型关系的并 \(R_S=\bigcup_rR_{S,r}:D_S\to M\)。

原始调度是映射

\[
\theta_S:D_S\to\mathbb Z^k.
\]

时间戳按严格词典序比较。多语句循环常取 \(\theta_S(i)=(i,0)\)、\(\theta_T(i)=(i,1)\)，常数分量记录同一轮的语句顺序。若不同事件仍可能同时间，必须增加语句位置或访问阶段，使原始执行顺序确定。

### 访问事件、access-site 与 phase

实例级访问关系不足以表达一条语句内部“先读后写”。为此给每个语法访问一个 access-site 标识 \(a\in\mathcal A_S\)，并把访问事件写成

\[
E_{S,a}=\{[x,a]_{S}\mid x\in D_S\}.
\]

事件到实例、事件到内存的映射分别为

\[
\begin{aligned}
\iota_{S,a}&=\{[x,a]_S\to[x]_S\mid x\in D_S\}:E_{S,a}\to D_S,\\
\mu_{S,a}&=\{[x,a]_S\to m\mid(x,m)\in A_{S,a}\}:E_{S,a}\to M,
\end{aligned}
\]

其中 \(A_{S,a}:D_S\to M\) 是该 site 的读或写访问。事件本身携带 site，故两个访问即使属于同一实例并落在同一地址，也仍可区分。

把实例调度拆成循环时间 \(\lambda_S(x)\) 与静态语句位置 \(\operatorname{pos}(S)\)，再给访问 site 一个阶段 \(\operatorname{phase}(a)\)，事件时间为

\[
\tau_{S,a}
=\{[x,a]_S\to[\lambda_S(x),\operatorname{pos}(S),\operatorname{phase}(a)]\}
:E_{S,a}\to\mathbb Z^h.
\]

也可把前两部分合写成已经包含语句位置的 \(\theta_S(x)\)，此时 \(\tau_{S,a}(x)=(\theta_S(x),\operatorname{phase}(a))\)。phase 只记录语言语义保证的顺序，不能为未指定求值顺序凭空选边。对 read-modify-write（RMW），累加器 read 必须具有严格早于同实例 write 的 phase；不同且互不冲突的只读 site 可以处于同一 phase。第 7 章先在事件与地址层选择最后/下一写，最后才投影到命名实例。

经典仿射模型要求循环边界、guard 和数组下标可由参数与外围循环变量的整数仿射/准仿射约束表达。\(A[2i+1]\)、固定模数 guard 和三角域可进入 Presburger 模型；\(A[B[i]]\)、数据决定的 while 次数和 \(A[ij]\) 一般不能直接精确建模。工程系统可保守近似或加入运行时检查，但不能把近似冒充精确语义。

## 手算示例

### 一维 shift：完整模型和 \(N=5\) 真值表

~~~c
for (int i = 1; i < N; ++i)
    S: A[i] = A[i - 1] + 1;
~~~

参数上下文为 \(C(N):N\ge2\)。域、读写和调度是

\[
\begin{aligned}
D_S(N)&=\{[i]_S\in\mathbb Z\mid1\le i<N\},\\
R_S&=\{[i]_S\to A[a]\mid1\le i<N\land a=i-1\}:D_S\to M_A,\\
W_S&=\{[i]_S\to A[a]\mid1\le i<N\land a=i\}:D_S\to M_A,\\
\theta_S&=\{[i]_S\to[i]\mid1\le i<N\}:D_S\to\mathbb Z.
\end{aligned}
\]

用简化单行打印核对方向，调度的坐标部分是 [i] -> [i]，完整类型仍为 \(\theta_S:D_S\to\mathbb Z\)；访问的左侧始终是实例，右侧始终是内存。

若把赋值拆成访问事件，读 site \(r\) 与写 site \(w\) 可取 \(\operatorname{phase}(r)=0\)、\(\operatorname{phase}(w)=1\)。相应事件调度为 \(\tau_{S,r}=\{[i,r]_S\to[i,0]\}:E_{S,r}\to\mathbb Z^2\) 与 \(\tau_{S,w}=\{[i,w]_S\to[i,1]\}:E_{S,w}\to\mathbb Z^2\)。这既保留迭代顺序，也记录同实例 read 早于 write。

固定 \(N=5\)：

| 原始时间 | 语句实例 | 读取地址 | 写入地址 |
|---:|---|---|---|
| 1 | \([1]_S\) | \(A[0]\) | \(A[1]\) |
| 2 | \([2]_S\) | \(A[1]\) | \(A[2]\) |
| 3 | \([3]_S\) | \(A[2]\) | \(A[3]\) |
| 4 | \([4]_S\) | \(A[3]\) | \(A[4]\) |

例如 \(W_S([2]_S)=A[2]\)，而 \(R_S([3]_S)=A[2]\)。\([1]_S\) 读到的 \(A[0]\) 来自循环外初始状态；\([4]_S\) 写出的 \(A[4]\) 没有域内消费者。这张表是第 7 章逐点重算关系的真值表。

### 矩阵转置/拷贝

~~~c
for (int i = 0; i < N; ++i)
  for (int j = 0; j < M; ++j)
    S: B[j][i] = A[i][j];
~~~

\[
\begin{aligned}
C(N,M)&:N\ge1\land M\ge1,\\
D_S&=\{[i,j]_S\in\mathbb Z^2\mid0\le i<N\land0\le j<M\},\\
R_{S,A}&=\{[i,j]_S\to A[a,b]\mid a=i\land b=j\}:D_S\to M_A,\\
W_{S,B}&=\{[i,j]_S\to B[a,b]\mid a=j\land b=i\}:D_S\to M_B,\\
\theta_S&=\{[i,j]_S\to[i,j]\}:D_S\to\mathbb Z^2.
\end{aligned}
\]

假定 \(M_A\) 与 \(M_B\) 不别名。换位发生在访问映射中，不在域中：实例仍由原循环的 \((i,j)\) 命名，写位置才是 \(B[j,i]\)。

### 两语句生产者—消费者

~~~c
for (int i = 0; i < N; ++i) {
    S: B[i] = A[i] + 1;
    T: C[i] = B[i] * 2;
}
~~~

取 \(C(N):N\ge1\)。两个命名域和四条访问为

\[
\begin{aligned}
D_S&=\{[i]_S\mid0\le i<N\},&
D_T&=\{[j]_T\mid0\le j<N\},\\
R_{S,A}&=\{[i]_S\to A[a]\mid a=i\}:D_S\to M_A,&
W_{S,B}&=\{[i]_S\to B[a]\mid a=i\}:D_S\to M_B,\\
R_{T,B}&=\{[j]_T\to B[a]\mid a=j\}:D_T\to M_B,&
W_{T,C}&=\{[j]_T\to C[a]\mid a=j\}:D_T\to M_C.
\end{aligned}
\]

\[
\theta_S=\{[i]_S\to[i,0]\}:D_S\to\mathbb Z^2,\qquad
\theta_T=\{[j]_T\to[j,1]\}:D_T\to\mathbb Z^2.
\]

把 \(T\) 的数学坐标改名为 \(j\) 不改变语义，也显示源代码变量名不能代替 statement identity。后续同址匹配得到 \([i]_S\to[i]_T\)，不会把两个 tuple 合成一个实例。

### 矩阵乘和归约维 \(k\)

假定 \(C\) 已清零：

~~~c
for (int i = 0; i < M; ++i)
  for (int j = 0; j < N; ++j)
    for (int k = 0; k < K; ++k)
      S: C[i][j] += A[i][k] * B[k][j];
~~~

取 \(C(M,N,K):M\ge1\land N\ge1\land K\ge1\)，三维域、访问和调度为

\[
\begin{aligned}
D_S&=\{[i,j,k]_S\in\mathbb Z^3\mid0\le i<M\land0\le j<N\land0\le k<K\},\\
R_{S,A}&=\{[i,j,k]_S\to A[a,b]\mid a=i\land b=k\}:D_S\to M_A,\\
R_{S,B}&=\{[i,j,k]_S\to B[a,b]\mid a=k\land b=j\}:D_S\to M_B,\\
R_{S,C}&=\{[i,j,k]_S\to C[a,b]\mid a=i\land b=j\}:D_S\to M_C,\\
W_{S,C}&=\{[i,j,k]_S\to C[a,b]\mid a=i\land b=j\}:D_S\to M_C,\\
\theta_S&=\{[i,j,k]_S\to[i,j,k]\}:D_S\to\mathbb Z^3.
\end{aligned}
\]

固定 \((i,j)\) 时，所有 \(k\) 实例读写同一 \(C[i,j]\)，所以 \(k\) 是归约维，不是 \(C\) 的地址维。它却分别出现在 \(A[i,k]\) 和 \(B[k,j]\) 的地址中。若把清零纳入模型，应给初始化语句 \(I\) 独立域 \(D_I=\{[i,j]_I\}\)、写关系 \(W_{I,C}:D_I\to M_C\) 和早于首个乘加的调度，不能无说明地把清零塞进 \(S(i,j,0)\)。

对 RMW 语义，再令 \(c_r,c_w\) 是 \(C\) 的读、写 site，取 \(\operatorname{phase}(c_r)=0<1=\operatorname{phase}(c_w)\)。于是

\[
\begin{aligned}
\tau_{S,c_r}&=\{[i,j,k,c_r]_S\to[i,j,k,0]\}:E_{S,c_r}\to\mathbb Z^4,\\
\tau_{S,c_w}&=\{[i,j,k,c_w]_S\to[i,j,k,1]\}:E_{S,c_w}\to\mathbb Z^4.
\end{aligned}
\]

同一 \(k\) 的 \(C\) read-to-write 顺序因此可见；\(A,B\) 的只读 site 与 \(C\) read 之间若语言未规定顺序，无需人为排序，因为它们访问不同抽象内存，不影响本章后续同址查询。

### 主案例 stencil 的模型接口

对 \(p=(T,N)\)，取 \(C(p):T\ge1\land N\ge3\)：

\[
\begin{aligned}
D_S(p)&=\{[t,i]_S\in\mathbb Z^2\mid1\le t\le T\land1\le i<N-1\},\\
W_S&=\{[t,i]_S\to A[u,v]\mid u=t\land v=i\}:D_S\to M_A,\\
R_{S,-1}&=\{[t,i]_S\to A[u,v]\mid u=t-1\land v=i-1\}:D_S\to M_A,\\
R_{S,0}&=\{[t,i]_S\to A[u,v]\mid u=t-1\land v=i\}:D_S\to M_A,\\
R_{S,+1}&=\{[t,i]_S\to A[u,v]\mid u=t-1\land v=i+1\}:D_S\to M_A,\\
\theta_S&=\{[t,i]_S\to[t,i]\}:D_S\to\mathbb Z^2.
\end{aligned}
\]

时间坐标 \(t\) 与内存首下标 \(u\) 数值相关，却属于不同类型；第 7 章仍必须沿“写实例 → 内存 → 读实例”复合。

## 编译器用途

1. **提取静态控制部分。** 循环边界与 guard 形成域，仿射下标形成访问，源程序嵌套和语句位置形成调度。
2. **建立跨语句连接。** 命名 tuple 区分 \(S[i]\) 和 \(T[i]\)；数组标签区分内存对象，使复合可检查类型。
3. **保存变换基线。** 原始调度描述原执行，新调度描述变换后执行；合法性与性能收益必须分别论证。
4. **识别归约候选。** 某维不出现在累加器地址中只是线索；还必须识别受支持的更新算子。
5. **划定精度边界。** 别名、间接访问和数据依赖控制流若不能排除，就要保守处理或加运行时条件。

关系对象及 API 语义以 [isl 官方手册](https://libisl.sourceforge.io/manual.pdf) 为工具语义来源。整数仿射约束用于依赖分析的背景见 Pugh 的 [Omega Test](https://doi.org/10.1145/125826.125848)。本章展开均为教学性推导，不替代具体语言的别名、溢出和求值顺序规则。

## 常见误区

1. **把访问写成 memory → instance。** 本教程固定 \(R,W:D\to M\)；反向匹配只在依赖构造时取逆。
2. **用循环变量名代替语句 identity。** \(S[i]\) 与 \(T[i]\) 是不同 tuple。
3. **把参数塞进实例 tuple。** \(N\) 属于上下文，\(i\) 才是实例坐标。
4. **遗漏语句内顺序。** 多语句若都只调度到 \([i]\)，时间并列，不能恢复原始全序。
5. **把数组下标相等当地址相同。** 无别名时 \(A[i]\ne B[i]\)；可能别名时也不能只凭变量名判为不同。
6. **把归约维当地址维。** \(k\) 不出现在 \(C[i,j]\) 地址中，正因多个实例累积同一元素。
7. **把间接访问伪装成仿射访问。** 删除 \(B[i]\) 这一间接层会改变语义。
8. **建模完成便宣称有依赖。** 同址、先后与覆盖尚未计算。
9. **用实例时间代替访问事件时间。** RMW 的 read 和 write 属于同一实例，却有必须保持的内部先后；缺少 phase 会漏掉内部 WAR，并制造错误的跨迭代 next-write。

## 练习

### 练习 EX06-B01｜仿射读写访问建模（基础）

设 \(N\ge0\)，数组 `A` 与 `B` 不别名。对

```c
for (int i = 0; i < N; ++i)
  S: B[2 * i + 1] = A[i];
```

写参数上下文、迭代域、读写访问和原调度，并注明每个对象的类型。

**答案索引：** [ANS-EX06-B01](#ans-ex06-b01)

### 练习 EX06-B02｜三角写域建模与枚举（基础）

给三角域 \(0\le j\le i<N\) 的写语句建模，固定 \(N=3\) 列出全部实例。

**答案索引：** [ANS-EX06-B02](#ans-ex06-b02)

### 练习 EX06-D01｜位移消费者的域与读关系（推导）

取 \(N\ge1\)。生产者为 `for (i=0;i<N;++i) P: B[i]=A[i]+1;`；消费者改为 `for (j=1;j<N;++j) T: C[j]=B[j-1];`。重写 \(D_T\) 和读关系，并给出访问地址范围。

**答案索引：** [ANS-EX06-D01](#ans-ex06-d01)

### 练习 EX06-C01｜矩阵乘初始化与同维时间戳（综合）

给矩阵乘增加清零语句 \(I\)，构造其域、访问和与更新语句同维的时间戳，保证每个 \((i,j)\) 的初始化早于 \(k=0\) 更新。

**答案索引：** [ANS-EX06-C01](#ans-ex06-c01)

### 练习 EX06-B03｜间接访问的建模边界（基础）

解释为什么 \(A[B[i]]\) 不能仅用 \(i,N\) 的仿射访问精确表示，并给出不改变程序语义的可行处理方向。

**答案索引：** [ANS-EX06-B03](#ans-ex06-b03)

## 本章小结

- 循环程序被拆成参数上下文、命名语句域、instance → memory 访问和 instance → time 原始调度。
- statement identity 来自命名 tuple，而不是循环变量名；数组标签和别名假设决定内存 identity。
- 一维 shift 的 \(N=5\) 真值表完整列出四个实例的读写地址，为精确依赖推导提供逐点基准。
- 转置把换位放在访问中；生产者—消费者需要两个命名 tuple 和语句位置；矩阵乘的 \(k\) 是归约维。
- access-site 区分同实例的多个读写，事件时间 \(\tau\) 在实例/语句位置之外加入 phase；RMW 的累加器 read 严格早于同实例 write。
- 建模只提供程序事实。同址、原始顺序和最后写/下一写必须继续计算，才能得到调度使用的依赖关系。
