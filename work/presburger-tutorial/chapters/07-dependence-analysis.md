# 第 7 章：精确数据依赖分析

## 直觉

两个动态实例访问同一地址，只说明它们可能冲突。精确依赖还要回答：source 是否先于 sink？它们之间是否有另一次写覆盖该值？

对 flow（RAW），sink 读到的是此前的**最后写**，不是任意更早写。对 anti（WAR），source 读必须早于此后的**第一次覆盖写**。对 output（WAW），直接边连接相邻写，而非所有有序写对。保留所有同址有序对可能仍保守安全，却会制造多余边，掩盖真正数据流和并行性。

访问始终按 **instance → memory** 读取；依赖始终按 **source → sink** 读取。访问逆关系只用来沿共享地址匹配，不会反转最终依赖含义。

## 形式定义

### 实例同址候选：复合方向不变

设 source 的一个访问 site 为 \(A_{S,a}:D_S\to M\)，sink 的一个访问 site 为 \(B_{T,b}:D_T\to M\)。严格按全文复合定义，

\[
\begin{aligned}
\operatorname{Same}_{a,b}
&=B_{T,b}^{-1}\circ A_{S,a}:D_S\to D_T,\\
(B_{T,b}^{-1}\circ A_{S,a})(x,y)
&\Longleftrightarrow\exists m:\ A_{S,a}(x,m)\land B_{T,b}(y,m).
\end{aligned}
\]

路径是 \(D_S\xrightarrow{A_{S,a}}M\xrightarrow{B_{T,b}^{-1}}D_T\)，第一元仍是 source。isl 对照是

~~~text
A_S_a.apply_range(B_T_b.reverse())
~~~

反写会得到 \(D_T\to D_S\)，不能仍称作同一个 source-to-sink 候选。该二元关系适合回答“是否同址”，但已经存在量化掉地址 \(m\)。若 source/sink 同时共享多个地址，不能在该投影结果上做覆盖删除；精确 last/next-write 必须先保留 access-site、事件和地址。

### 带地址的事件候选

沿用第 6 章事件模型。令 \(E_R\) 与 \(E_W\) 分别为所有读、写事件的带类型不交并，\(\mathcal D=\biguplus_S D_S\) 为所有命名实例空间的不交并。定义

\[
\iota:E_R\uplus E_W\to\mathcal D,\qquad
\mu:E_R\uplus E_W\to M,\qquad
\tau:E_R\uplus E_W\to\mathbb Z^h,
\]

分别给出事件所属实例、地址和包含循环时间、语句位置、访问 phase 的时间戳。事件已携带 access-site；若两个 site 具有语言规定的先后，\(\tau\) 必须反映它，若未规定则不能任意制造顺序。

三类“同址且 source 早于 sink”的候选保留地址坐标：

\[
\begin{aligned}
K_{RAW}
&=\{(w,m,r)\in E_W\times M\times E_R\mid
\mu(w)=m=\mu(r)\land\tau(w)\mathrel{\mathrm{lex}<}\tau(r)\},\\
K_{WAR}
&=\{(r,m,w)\in E_R\times M\times E_W\mid
\mu(r)=m=\mu(w)\land\tau(r)\mathrel{\mathrm{lex}<}\tau(w)\},\\
K_{WAW}
&=\{(w_1,m,w_2)\in E_W\times M\times E_W\mid
\mu(w_1)=m=\mu(w_2)\land\tau(w_1)\mathrel{\mathrm{lex}<}\tau(w_2)\}.
\end{aligned}
\]

这等价于逐 access-site 对构造 \(B^{-1}\circ A\)、附回共同地址与事件，再取并；关键是不能先把不同地址折叠为同一个实例对。

### 在同一地址上选择 last/next write

RAW 中被覆盖的三元候选为

\[
\begin{aligned}
B_{RAW}=\{(w,m,r)\in K_{RAW}\mid
\exists w'\in E_W:\ &\mu(w')=m\\
&\land\tau(w)\mathrel{\mathrm{lex}<}\tau(w')
\land\tau(w')\mathrel{\mathrm{lex}<}\tau(r)\}.
\end{aligned}
\]

故精确事件级 flow 是

\[
F_{RAW}=K_{RAW}\setminus B_{RAW}\subseteq E_W\times M\times E_R.
\]

它对每个 sink 读和地址 \(m\) 选择此前时间最大的写。没有域内写的读来自 live-in，不会凭空产生 source。

WAR 和 WAW 都对 source 事件选择下一次同址写。令 \(K\) 分别取 \(K_{WAR}\) 或 \(K_{WAW}\)，其中三元组统一记作 \((e,m,w)\)。跳过了更早覆盖写的候选为

\[
B_{\mathrm{next}}(K)
=\{(e,m,w)\in K\mid
\exists w'\in E_W:\ \mu(w')=m
\land\tau(e)\mathrel{\mathrm{lex}<}\tau(w')
\land\tau(w')\mathrel{\mathrm{lex}<}\tau(w)\}.
\]

其中量词类型完整为 \(w'\in E_W\)，地址为该候选已有的 \(m\in M\)；若按语句展开，则写事件还带 \(U\in\mathcal W\)、\(z\in D_U\) 与写 access-site。于是

\[
\begin{aligned}
F_{WAR}&=K_{WAR}\setminus B_{\mathrm{next}}(K_{WAR})
\subseteq E_R\times M\times E_W,\\
F_{WAW}&=K_{WAW}\setminus B_{\mathrm{next}}(K_{WAW})
\subseteq E_W\times M\times E_W.
\end{aligned}
\]

中间读不覆盖值；只有同一 \(m\) 上的中间写删除候选。

### 最后投影为实例依赖

对任一事件级关系 \(F_X\)，先完成地址级选择，再定义

\[
\begin{aligned}
I_X&=\{(e_s,m,e_t)\in F_X\mid\iota(e_s)=\iota(e_t)\},\\
\Delta_X&=\{\iota(e_s)\to\iota(e_t)\mid
(e_s,m,e_t)\in F_X\land\iota(e_s)\ne\iota(e_t)\}
:\mathcal D\to\mathcal D.
\end{aligned}
\]

\(I_X\) 是同一命名实例内部的事件边，由语句/RMW 语义保证，不产生不可能的实例调度约束 \(\theta(x)<\theta(x)\)。\(\Delta_X\) 才交给实例调度器；不同静态语句的 tuple identity 不同，即使坐标相同也不会被误归为内部边。投影后，多个地址可合并成同一实例对，但此时每个地址的 last/next-write 决策已经完成，不会相互误删。

Feautrier 的 [Dataflow Analysis of Array and Scalar References](https://doi.org/10.1007/BF01407931) 是精确最后写语义的一手来源。这里的事件三元组、差集和投影顺序是适配本教程方向、RMW 与多访问例的教学性推导。isl API 含义以 [isl 官方手册](https://libisl.sourceforge.io/manual.pdf) 为工具语义来源。

## 手算示例

### 一维 shift：精确 \(\Delta_{RAW}\) 与 \(N=5\) 对照

沿用第 6 章：

\[
\begin{aligned}
C(N)&:N\ge2,&
D_S&=\{[i]_S\mid1\le i<N\},\\
W_S&=\{[i]_S\to A[a]\mid a=i\}:D_S\to M_A,&
R_S&=\{[j]_S\to A[a]\mid a=j-1\}:D_S\to M_A,\\
\theta_S&=\{[i]_S\to[i]\}:D_S\to\mathbb Z.
\end{aligned}
\]

先求同址：

\[
\begin{aligned}
R_S^{-1}\circ W_S
&=\{[i]_S\to[j]_S\mid
\exists a:\ a=i\land a=j-1\\
&\hspace{30mm}\land1\le i<N\land1\le j<N\}\\
&=\{[i]_S\to[i+1]_S\mid1\le i<N-1\}:D_S\to D_S.
\end{aligned}
\]

原始顺序 \(i<j\) 自动成立。整数 \(k\) 不可能满足 \(i<k<i+1\)，故无中间覆盖写：

\[
\boxed{\Delta_{RAW}^{S\to S}
=\{[i]_S\to[i+1]_S\mid1\le i<N-1\}:D_S\to D_S.}
\]

省略 tuple 名后的坐标打印为 [i] -> [i + 1]；完整关系类型仍为 \(D_S\to D_S\)，并按 source 实例到 sink 实例读取。

\(N=5\) 时：

| source 写 | 共享地址 | sink 读 | 中间写 | 精确 RAW |
|---|---|---|---|---|
| \([1]_S\) 写 \(A[1]\) | \(A[1]\) | \([2]_S\) 读 \(A[1]\) | 无 | \([1]_S\to[2]_S\) |
| \([2]_S\) 写 \(A[2]\) | \(A[2]\) | \([3]_S\) 读 \(A[2]\) | 无 | \([2]_S\to[3]_S\) |
| \([3]_S\) 写 \(A[3]\) | \(A[3]\) | \([4]_S\) 读 \(A[3]\) | 无 | \([3]_S\to[4]_S\) |

\([1]_S\) 对 \(A[0]\) 的读没有域内 producer，\([4]_S\) 写 \(A[4]\) 后没有域内 consumer。这与第 6 章四行真值表一致。距离 \(j-i=1\) 只是最终关系的摘要，不能代替域、访问、同址、顺序和覆盖推导。

### 多地址反例：先投影会误删依赖

考虑一个 source/sink 实例对同时共享 \(A[i]\) 和 \(B[i]\)，但中间只覆盖 \(A[i]\)：

~~~c
for (int i = 0; i < N; ++i) {
    S: A[i] = B[i] = 1;
    U: A[i] = 2;
    T: x[i] = A[i] + B[i];
}
~~~

取 \(C(N):N\ge1\)，\(D_S,D_U,D_T\) 为各命名 tuple 上的 \(0\le i<N\)。令 \(s_A,s_B,u_A,t_A,t_B\) 为相应访问 site。相关实例访问均注明类型：

\[
\begin{aligned}
W_{S,s_A}&=\{[i]_S\to A[i]\}:D_S\to M_A,&
W_{S,s_B}&=\{[i]_S\to B[i]\}:D_S\to M_B,\\
W_{U,u_A}&=\{[i]_U\to A[i]\}:D_U\to M_A,&
R_{T,t_A}&=\{[i]_T\to A[i]\}:D_T\to M_A,\\
R_{T,t_B}&=\{[i]_T\to B[i]\}:D_T\to M_B.
\end{aligned}
\]

原始事件顺序为 \(S\) 的写事件早于 \(U\) 写，\(U\) 又早于 \(T\) 的读。对每个 \(i\)，带地址 RAW 候选恰有

\[
\begin{aligned}
&(s_A(i),A[i],t_A(i)),\\
&(s_B(i),B[i],t_B(i)),\\
&(u_A(i),A[i],t_A(i)).
\end{aligned}
\]

在 \(A[i]\) 上，\(u_A(i)\) 覆盖 \(s_A(i)\)，所以第一项进入 \(B_{RAW}\)；在 \(B[i]\) 上没有中间写，第二项必须保留；第三项也是 \(A[i]\) 的最后写。故

\[
F_{RAW}
=\{(s_B(i),B[i],t_B(i)),(u_A(i),A[i],t_A(i))\mid0\le i<N\}.
\]

最后投影才得到

\[
\Delta_{RAW}
=\{[i]_S\to[i]_T\mid0\le i<N\}
\cup\{[i]_U\to[i]_T\mid0\le i<N\},
\]

两个分支类型分别为 \(D_S\to D_T\) 和 \(D_U\to D_T\)。若先把两个地址都投影成实例候选 \([i]_S\to[i]_T\)，再因为存在 \(U[i]\) 覆盖 \(A[i]\) 而删除整对，就会错误丢掉 \(B[i]\) 上真实的 \(S\to T\) flow。这正是事件×地址×事件选择必须先于实例投影的原因。

### RAW：最后写排除更早 producer

使用不同短程序：

~~~c
for (int i = 0; i < N; ++i) {
    S: A[i] = 1;
    U: A[i] = 2;
    T: x[i] = A[i];
}
~~~

取 \(C(N):N\ge1\)，\(D_S,D_U,D_T\) 分别是各命名 tuple 上的 \(0\le i<N\)。相关访问是

\[
\begin{aligned}
W_S&=\{[i]_S\to A[a]\mid a=i\}:D_S\to M_A,\\
W_U&=\{[u]_U\to A[a]\mid a=u\}:D_U\to M_A,\\
R_T&=\{[j]_T\to A[a]\mid a=j\}:D_T\to M_A.
\end{aligned}
\]

原始调度为

\[
\theta_S=\{[i]_S\to[i,0]\}:D_S\to\mathbb Z^2,\quad
\theta_U=\{[u]_U\to[u,1]\}:D_U\to\mathbb Z^2,\quad
\theta_T=\{[j]_T\to[j,2]\}:D_T\to\mathbb Z^2.
\]

同址关系为

\[
R_T^{-1}\circ W_S=\{[i]_S\to[i]_T\}:D_S\to D_T,\qquad
R_T^{-1}\circ W_U=\{[i]_U\to[i]_T\}:D_U\to D_T.
\]

两者均通过顺序过滤，但 \(S[i]\to T[i]\) 中间有同址写 \(U[i]\)，故被差集移除；\(U[i]\to T[i]\) 无中间写：

\[
\boxed{\Delta_{RAW}=\{[i]_U\to[i]_T\mid0\le i<N\}:D_U\to D_T.}
\]

### WAR：读必须早于第一次覆盖写

~~~c
for (int i = 0; i < N; ++i) {
    R: x[i] = A[i];
    W: A[i] = 0;
    V: A[i] = 1;
}
~~~

取 \(C(N):N\ge1\)，\(D_R,D_W,D_V\) 为各命名 tuple 上的 \(0\le i<N\)：

\[
\begin{aligned}
R_R&=\{[i]_R\to A[a]\mid a=i\}:D_R\to M_A,\\
W_W&=\{[w]_W\to A[a]\mid a=w\}:D_W\to M_A,\\
W_V&=\{[v]_V\to A[a]\mid a=v\}:D_V\to M_A.
\end{aligned}
\]

原始调度分别为 \(\theta_R=\{[i]_R\to[i,0]\}:D_R\to\mathbb Z^2\)、\(\theta_W=\{[w]_W\to[w,1]\}:D_W\to\mathbb Z^2\)、\(\theta_V=\{[v]_V\to[v,2]\}:D_V\to\mathbb Z^2\)。

同址与顺序给出 \(\{[i]_R\to[i]_W\}:D_R\to D_W\) 和 \(\{[i]_R\to[i]_V\}:D_R\to D_V\)。前者是第一次写；后者之前已有 \(W[i]\)，故删除：

\[
\boxed{\Delta_{WAR}=\{[i]_R\to[i]_W\mid0\le i<N\}:D_R\to D_W.}
\]

它保护 \(R[i]\) 读取旧值。更晚的 \(V[i]\) 由 \(W\to V\) 的 WAW 链间接排在后面，无需非直接边 \(R\to V\)。

### WAW：相邻写形成直接链

~~~c
for (int i = 0; i < N; ++i) {
    P: A[i] = 1;
    Q: A[i] = 2;
    Z: A[i] = 3;
}
~~~

取 \(C(N):N\ge1\)，\(D_P,D_Q,D_Z\) 为各命名 tuple 上的 \(0\le i<N\)：

\[
\begin{aligned}
W_P&=\{[i]_P\to A[a]\mid a=i\}:D_P\to M_A,\\
W_Q&=\{[q]_Q\to A[a]\mid a=q\}:D_Q\to M_A,\\
W_Z&=\{[z]_Z\to A[a]\mid a=z\}:D_Z\to M_A.
\end{aligned}
\]

调度分别为 \(\theta_P=\{[i]_P\to[i,0]\}:D_P\to\mathbb Z^2\)、\(\theta_Q=\{[q]_Q\to[q,1]\}:D_Q\to\mathbb Z^2\)、\(\theta_Z=\{[z]_Z\to[z,2]\}:D_Z\to\mathbb Z^2\)。

同址加顺序候选为

\[
\{[i]_P\to[i]_Q\}:D_P\to D_Q,\quad
\{[i]_P\to[i]_Z\}:D_P\to D_Z,\quad
\{[i]_Q\to[i]_Z\}:D_Q\to D_Z.
\]

\(P[i]\to Z[i]\) 中间有写 \(Q[i]\)，故删除；其余没有中间写：

\[
\boxed{\Delta_{WAW}=
\{[i]_P\to[i]_Q\mid0\le i<N\}
\cup\{[i]_Q\to[i]_Z\mid0\le i<N\}.}
\]

两个分支类型分别是 \(D_P\to D_Q\) 与 \(D_Q\to D_Z\)；放进 union map 后 tuple 名仍保留类型。直接链保证最后留下 3，而多余传递边不属于精确 WAW。

### 无依赖：同余排除区间伪冲突

~~~c
for (int i = 0; i < N; ++i)
    S: A[2*i] = 1;
for (int j = 0; j < N; ++j)
    T: x[j] = A[2*j + 1];
~~~

取 \(C(N):N\ge2\)：

\[
\begin{aligned}
D_S&=\{[i]_S\mid0\le i<N\},&
W_S&=\{[i]_S\to A[a]\mid a=2i\}:D_S\to M_A,\\
D_T&=\{[j]_T\mid0\le j<N\},&
R_{T,A}&=\{[j]_T\to A[a]\mid a=2j+1\}:D_T\to M_A,\\
&&W_{T,x}&=\{[j]_T\to x[b]\mid b=j\}:D_T\to M_x.
\end{aligned}
\]

假定 \(M_A\cap M_x=\varnothing\)，即 \(A\) 与 \(x\) 不别名。\(\theta_S=\{[i]_S\to[0,i]\}:D_S\to\mathbb Z^2\)、\(\theta_T=\{[j]_T\to[1,j]\}:D_T\to\mathbb Z^2\)，所以所有 \(A\) 写先于所有 \(A\) 读。同址却要求

\[
2i=2j+1.
\]

左侧模 2 为 0，右侧为 1，整数上无解：

\[
(R_{T,A})^{-1}\circ W_S=\varnothing:D_S\to D_T,\qquad
\boxed{\Delta_{RAW}=\varnothing:D_S\to D_T.}
\]

若只取各自地址的凸区间，写落在 \([0,2N-2]\)，读落在 \([1,2N-1]\)；当 \(N\ge2\) 时二者相交，区间分析会报告伪候选。精确投影保留写地址 \(a\equiv0\pmod2\) 与读地址 \(a\equiv1\pmod2\)，Omega 风格整数可行性检查判交为空。实数松弛中 \(i=j+\tfrac12\) 可行，整数程序却无实例。

还要检查其余访问：\(S[i]\) 写的偶地址随 \(i\) 单射，故不同 \(S\) 实例之间无 WAW；每个 \(x[j]\) 也恰写一次且从不读取，故 \(M_x\) 上无 RAW、WAR 或 WAW；不别名假设又排除了 \(A\) 与 \(x\) 的交叉冲突。因此这里确实是整个短程序无依赖，而不只是 \(A\) 上 RAW 为空。这说明 Pugh 的 [Omega Test](https://doi.org/10.1145/125826.125848) 所强调的整数精确性为何重要。

### 归约依赖：普通冲突不等于禁止并行

~~~c
for (int i = 0; i < N; ++i)
    S: sum += A[i];
~~~

取 \(C(N):N\ge1\)、\(D_S=\{[i]_S\mid0\le i<N\}\)：

\[
\begin{aligned}
R_{S,A}&=\{[i]_S\to A[a]\mid a=i\}:D_S\to M_A,\\
R_{S,sum}&=W_{S,sum}=\{[i]_S\to sum\}:D_S\to M_{sum},\\
\theta_S&=\{[i]_S\to[i]\}:D_S\to\mathbb Z.
\end{aligned}
\]

令 \(a_i\) 是读 \(A[i]\) 的事件，\(r_i\) 是读 sum 的事件，\(w_i\) 是写 sum 的事件。事件映射例如

\[
\begin{aligned}
\iota(r_i)&=\iota(w_i)=[i]_S,&
\mu(r_i)&=\mu(w_i)=sum,\\
\tau(r_i)&=[i,0],&
\tau(w_i)&=[i,1].
\end{aligned}
\]

这里 \(\iota:\{r_i,w_i\}\to D_S\)、\(\mu:\{r_i,w_i\}\to M_{sum}\)、\(\tau:\{r_i,w_i\}\to\mathbb Z^2\)；关键是 \(r_i\) 的 read phase 0 严格早于 \(w_i\) 的 write phase 1。\(a_i\) 访问不别名的 \(M_A\)，与 sum 事件没有同址边；它和 \(r_i\) 之间若语言未规定求值顺序，不必人为排序。

固定 \(N=3\)，相关 read/write 事件可枚举为：

| 迭代 | 数组读事件 | 累加器读事件 | 累加器写事件 | 必须的实例内顺序 |
|---:|---|---|---|---|
| 0 | \(a_0:R\,A[0]\) | \(r_0:R\,sum\) | \(w_0:W\,sum\) | \(r_0\prec w_0\) |
| 1 | \(a_1:R\,A[1]\) | \(r_1:R\,sum\) | \(w_1:W\,sum\) | \(r_1\prec w_1\) |
| 2 | \(a_2:R\,A[2]\) | \(r_2:R\,sum\) | \(w_2:W\,sum\) | \(r_2\prec w_2\) |

按带地址候选和 next-write/last-write 选择，直接普通内存依赖恰为

\[
\begin{aligned}
F_{RAW}&=\{(w_0,sum,r_1),(w_1,sum,r_2)\},\\
F_{WAR}&=\{(r_0,sum,w_0),(r_1,sum,w_1),(r_2,sum,w_2)\},\\
F_{WAW}&=\{(w_0,sum,w_1),(w_1,sum,w_2)\}.
\end{aligned}
\]

\(r_i\) 后的 next write 是同实例 \(w_i\)，所以不存在虚假的跨迭代 WAR \(r_i\to w_{i+1}\)。三个 WAR 都属于内部集合 \(I_{WAR}\)，由 RMW 语义保证，不投影为实例调度约束。RAW 和 WAW 投影后都给出相邻实例链 \([0]_S\to[1]_S\)、\([1]_S\to[2]_S\)。

识别出 \(sum=sum\oplus value(i)\) 后，可把这个跨迭代 recurrence bundle 单独分类为归约依赖

\[
\Delta_{red}^{S\to S}
=\{[i]_S\to[i+1]_S\mid0\le i<N-1\}:D_S\to D_S.
\]

这不是否认普通 RAW/WAW 的存在，而是为合法的私有化与合并提供更高层语义。内部 \(r_i\to w_i\) 仍是每次 RMW 必须保持的语句内部行为。归约私有化让 worker 各自累积，再以 \(\oplus\) 合并；它改变中间内存事件，只有算子和语言语义允许时才保持结果。

矩阵乘同理。对固定 \((i,j)\)，令 \(r_k^C,w_k^C\) 是第 \(k\) 次更新对 \(C[i,j]\) 的读写事件，则

\[
\begin{aligned}
F_{RAW}^C&=\{(w_k^C,C[i,j],r_{k+1}^C)\mid0\le k<K-1\},\\
F_{WAR}^C&=\{(r_k^C,C[i,j],w_k^C)\mid0\le k<K\},\\
F_{WAW}^C&=\{(w_k^C,C[i,j],w_{k+1}^C)\mid0\le k<K-1\}.
\end{aligned}
\]

其中 WAR 是同一 \([i,j,k]_S\) 内部的 read-to-write；RAW/WAW 是相邻 \(k\) 的实例依赖。归约分类把跨 \(k\) recurrence 表示为

\[
\Delta_{red}^{S\to S}
=\{[i,j,k]_S\to[i,j,k+1]_S\mid
0\le i<M\land0\le j<N\land0\le k<K-1\}:D_S\to D_S.
\]

不同 \((i,j)\) 地址不同。并行化 \(k\) 需要私有化、树形合并或合适原子/归约原语，不能只删除边。

数学整数加法满足结合、交换律；固定宽度无符号模加法也有相应代数律，但有符号溢出须服从语言。IEEE 浮点加法一般不满足结合律，重排改变舍入顺序，NaN、无穷和有符号零也可能影响结果。因此浮点重结合只有在语言规则、显式快速数学选项或用户容差/可重现性约定允许时才合法。归约依赖必须与一般 flow 分开处理。

### 多语句与 stencil

第 6 章生产者—消费者中：

\[
R_{T,B}^{-1}\circ W_{S,B}
=\{[i]_S\to[i]_T\mid0\le i<N\}:D_S\to D_T.
\]

\((i,0)\mathrel{\mathrm{lex}<}(i,1)\)，且无其他 \(B[i]\) 写，所以这也是精确 \(\Delta_{RAW}^{S\to T}\)。坐标数值相同，tuple identity 仍分别是 producer \(S\) 与 consumer \(T\)。

对主 stencil 的读偏移 \(\delta\in\{-1,0,+1\}\)，source 写 \(A[t-1,i+\delta]\)，sink \(S[t,i]\) 读取：

\[
\Delta_{\delta}^{S\to S}
=\{[t-1,i+\delta]_S\to[t,i]_S\mid
2\le t\le T\land1\le i<N-1\land1\le i+\delta<N-1\}:D_S\to D_S.
\]

边界处若 producer 不在更新域，读值来自初始/边界条件。三个分支都从较早时间层 source 指向较晚时间层 sink。

### Presburger/Omega 操作的职责

1. **判空。** 检查同址加顺序约束是否有整数解；奇偶例在此被判空。
2. **投影。** 覆盖查询可消去中间写事件 \(w'\) 及其实例坐标，但必须暂时保留候选的共同地址 \(m\) 和端点 access-site；last/next-write 完成后，才把 \(m\) 与 site 投影掉得到实例关系。逻辑上这些都是存在量词消去，先后次序却影响精确性。
3. **词典序最大/最小。** 对 sink 读和固定地址从先行写事件中取最大时间得到最后写；对 source 读/写和固定地址从后继写事件中取最小时间得到第一次覆盖写。必须使用含循环时间、语句位置与 access phase 的完整 \(\tau\)。
4. **差集。** 在事件×地址×事件的三元候选上减去存在同址中间写的项，实现“候选且不存在覆盖见证”；不能在已折叠多个地址的实例对上做这一步。

Omega Test 为整数仿射可行性与依赖检查提供经典依据；Feautrier 给出精确数据流的最后写路线。本教程只声称给定 Presburger 模型内精确；若前端使用区间、凸包或别名近似，整体精度仍受这些近似限制。

## 编译器用途

1. **调度合法性输入。** 先把内部事件边 \(I_X\) 与跨实例边分开，再汇总 \(\Delta=\Delta_{RAW}\cup\Delta_{WAR}\cup\Delta_{WAW}\)；新实例调度必须让每条 \(x\to y\) 仍从 source 指向 sink。内部 RMW phase 由语句语义保持，合法实现的归约边另按归约规则处理。
2. **揭示并行性。** 删除被覆盖的传递候选，避免无意义固定早期写与远期访问；精确性不自动保证性能更好。
3. **解释值来源。** RAW 把每次读连到实际 producer，可用于值转发和通信生成；live-in/live-out 需单独表示。
4. **重命名与私有化。** WAR/WAW 常来自存储复用；数组扩张或 SSA 化可消除某些边，但须证明可观察结果不变。
5. **归约并行化。** 仍要选择私有化、合并顺序和数值语义；合法性与速度收益分别论证。

## 常见误区

1. **把 \(W_S^{-1}\circ R_T\) 当成 S → T。** 它是 \(D_T\to D_S\)；正确候选是 \(R_T^{-1}\circ W_S:D_S\to D_T\)。
2. **把 isl 复合写反。** \(R_T^{-1}\circ W_S\) 对应 W_S.apply_range(R_T.reverse())。
3. **把同址且有序称为精确 flow。** 还须排除中间覆盖写，或等价地取最后写。
4. **三类依赖都取“最后写”。** RAW 对 sink 取先行写最大者；WAR/WAW 对 source 取后继写最小者。
5. **中间读算覆盖。** 读不改变值；覆盖条件寻找中间写。
6. **只给 distance vector。** 它丢失 tuple、边界、分支和 live-in，不能替代完整关系。
7. **把归约链当普通 flow 后直接删除。** 删除边须伴随私有化/合并并满足重结合条件。
8. **默认浮点加法可结合。** 常规 IEEE 语义下重排可能改变结果，需要显式许可。
9. **用实区间覆盖整数同余。** 区间相交不证明存在整数同址实例。
10. **过早投影共同地址。** 一个实例对可共享多个位置，只覆盖其中一个不能删除另一个位置上的依赖。
11. **RMW 只使用实例调度。** read 与 write 同属一个实例；缺少 access phase 会漏掉内部 WAR，并把 next write 错推到下一迭代。
12. **把内部事件边交给实例调度器。** \(r_i\to w_i\) 约束语句内部语义，不要求同一实例满足 \(\theta(i)<\theta(i)\)。

## 练习

### 练习 EX07-B01｜两语句 shift 的精确 RAW（基础）

取 \(N\ge1\)。先执行 `for (i=0;i<N;++i) P: A[i]=f(i);`，再执行 `for (j=1;j<N;++j) Q: x[j]=A[j-1];`，且 `A` 与 `x` 不别名。按复合定义推导同址候选、原始顺序和精确 RAW；答案中标明 source 与 sink。

**答案索引：** [ANS-EX07-B01](#ans-ex07-b01)

### 练习 EX07-D01｜删除覆盖写后的 RAW 重算（推导）

在 RAW 覆盖例中删除 \(U\)，从访问、同址候选、顺序与 `Covered` 差集开始重算，并解释为何不能只从旧精确依赖中删边。

**答案索引：** [ANS-EX07-D01](#ans-ex07-d01)

### 练习 EX07-D02｜四次连续写的精确 WAW 链（推导）

构造四次连续同址写的 WAW 候选，再按 next-write 只保留相邻链，注明每个 union 分支的 source/sink 类型。

**答案索引：** [ANS-EX07-D02](#ans-ex07-d02)

### 练习 EX07-D03｜模 3 排除伪冲突（推导）

取 \(N\ge2\)。先执行 \(S(i):A[3i]=1\)（\(0\le i<N\)），再执行 \(T(j):x[j]=A[3j+1]\)（\(0\le j<N\)），且 `A` 与 `x` 不别名。证明 `A` 上 source \(S\) 到 sink \(T\) 的 RAW 为空，并比较整数判空与地址区间近似。

**答案索引：** [ANS-EX07-D03](#ans-ex07-d03)

### 练习 EX07-C01｜矩阵乘初始化 RAW 与归约边（综合）

给矩阵乘加入初始化，推导 source 初始化实例到 sink \(k=0\) 更新的 RAW，以及 source \(k\) 到 sink \(k+1\) 的相邻归约边；讨论 \(K=0\) 与 \(K=1\) 的边界。

**答案索引：** [ANS-EX07-C01](#ans-ex07-c01)

### 练习 EX07-C02｜Covered 差集与 lexmax 等价（综合）

某个 sink 读事件前有三个同址写。分别用“候选差去 `Covered`”和“按地址取词典序最大先行写”求 producer，并证明两种方法一致。

**答案索引：** [ANS-EX07-C02](#ans-ex07-c02)

### 练习 EX07-C03｜多地址 last-write 后投影（综合）

重算多地址反例：分别在 \(A[i]\)、\(B[i]\) 上做 last-write，再投影地址；说明为何先投影地址的算法会误删真实边。

**答案索引：** [ANS-EX07-C03](#ans-ex07-c03)

### 练习 EX07-C04｜RMW phase 与内部 WAR（综合）

枚举 \(N=3\) 的 `sum += A[i]` RMW 读写事件，用 phase 与 next-write 证明 WAR 只含三个内部 read-to-write 边，并解释为何它们不要求实例调度满足 \(\theta(i)<\theta(i)\)。

**答案索引：** [ANS-EX07-C04](#ans-ex07-c04)

## 本章小结

- 同址候选严格写成 \(B_T^{-1}\circ A_S:D_S\to D_T\)，isl 对照为 A_S.apply_range(B_T.reverse())；二者都保持 source → sink。
- 精确选择必须保留 access-site、事件和共同地址 \(m\)：在事件×地址×事件候选上选择 last/next-write，最后才投影为实例依赖。
- RAW 对 sink 事件和地址选择此前最后写；WAR 与 WAW 对 source 事件和地址选择此后第一次写。中间读不覆盖，中间写才切断直接边。
- 一维 shift 的精确关系是 \(\Delta_{RAW}^{S\to S}=\{[i]_S\to[i+1]_S\mid1\le i<N-1\}\)，\(N=5\) 时恰有三条可核对边。
- RAW、WAR、WAW、无依赖和归约依赖必须分开解释；距离向量不能替代完整推导。
- RMW 的 \(\tau\) 必须含 access phase；同实例 read-to-write WAR 属于内部语义，跨实例 RAW/WAW 才约束实例调度。
- 精确同余可排除区间/实松弛的伪依赖；投影地址必须推迟到覆盖选择之后。
- 归约依赖抽象普通跨迭代 recurrence，而不抹掉内部 RMW；并行化还受私有化、合并、整数溢出、浮点重结合和语言选项约束。
