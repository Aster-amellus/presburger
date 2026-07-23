# 资料基线与结论—来源映射

本表只把原始论文、作者公开稿、稳定馆藏或官方手册作为定理与工具语义的依据；百科页面不作为定理依据。章节中的教学性推导会另行标注，不能替代这些来源。

## 一手资料表

| 来源 | 可支持内容 | 使用章节 |
|---|---|---|
| Mojżesz Presburger (1929)，英文译注稳定存档：[Stansifer, *On the Completeness of a Certain System of Arithmetic of Whole Numbers*](https://hdl.handle.net/1813/6478) | Presburger 算术的原始完备性、可判定性工作及其历史语境。 | 2、3 |
| D. C. Cooper (1972), [卷目录](https://www.doc.ic.ac.uk/~shm/MI/mi7.html)，[原文扫描全文](https://www21.in.tum.de/teaching/logik/SS16/Exercises/Cooper.pdf) | 整数线性算术的量词消去方法；投影与存在量词消去的联系。卷目录提供书目信息，全文扫描是正文入口。 | 3、4、11 |
| Seymour Ginsburg and Edwin Spanier (1966), [*Semigroups, Presburger Formulas, and Languages*](https://msp.org/pjm/1966/16-2/pjm-v16-n2-p09-p.pdf), [DOI](https://doi.org/10.2140/pjm.1966.16.285) | 该文在非负整数格点 `ℕ^n` 上讨论 modified Presburger formulas 与半线性集的等价；整数版需经显式编码后再搬运该结论。 | 2、5 |
| D. C. Cooper (1972) 与 Ginsburg–Spanier (1966) | 自然数版、整数版与半线性表述之间的教学路线：每个整数坐标可编码为两个非负坐标之差（或正负部分），并对公式与集合解释作相应搬运；具体定理仍分别回溯到相应原文。 | 2、3、5 |
| William Pugh (1991/1992), [*The Omega Test*](https://doi.org/10.1145/125826.125848) | 整数仿射约束的可行性/判定与编译器依赖分析中的 Omega 方法。 | 6、7、12 |
| Paul Feautrier (1991), [*Dataflow Analysis of Array and Scalar References*](https://doi.org/10.1007/BF01407931) | 精确数据流（flow/最后写）分析：候选同址冲突之外，还需刻画写入顺序与中间覆盖。 | 7、12 |
| Paul Feautrier (1992), [*Some Efficient Solutions to the Affine Scheduling Problem, Part I*](https://doi.org/10.1007/BF01407835)；[Part II](https://doi.org/10.1007/BF01379404) | 仿射调度、合法性约束与用 Farkas 乘子将全称非负约束有限化的经典路线。 | 8、9、10、12 |
| Fabien Quilleré, Sanjay Rajopadhye, and Doran Wilde (2000), [*Generation of Efficient Nested Loops from Polyhedra*](https://doi.org/10.1023/A:1007554627716) | 从 polyhedra 扫描到高效嵌套循环的代码生成问题。 | 11、12 |
| Cédric Bastoul (2004), [*Code Generation in the Polyhedral Model Is Easier Than You Think*](https://icps.u-strasbg.fr/~bastoul/research/papers/Bas04-PACT.pdf) | CLooG 风格的扫描、整数边界、参数条件与代码生成。 | 11、12 |
| [isl 官方手册](https://libisl.sourceforge.io/manual.pdf) | **工具语义来源**：isl 的集合、映射、schedule、AST 对象及其操作接口；它不替代数学定理的证明来源。 | 4、6、8、11、12 |
| Uday Bondhugula 等，[Pluto 项目/作者资料页](https://www.ece.lsu.edu/jxr/pluto/)；[Pluto+ DOI](https://doi.org/10.1145/2896389) | 面向并行性与局部性的仿射变换实践与 Pluto+ 相关扩展。 | 8、10、12 |
| [*Verified Code Generation for the Polyhedral Model*](https://xavierleroy.org/publi/polyhedral-codegen.pdf) | 代码生成的语义保持及其进一步阅读；用于区分“生成出循环”和“证明生成保持语义”。 | 11、12 |

## 结论—来源映射

| 结论或术语 | 直接依据 | 在教程中的使用边界 |
|---|---|---|
| 可判定性 | Presburger (1929) 的稳定英文译注 | 指 Presburger 算术的判定问题；不推出实际工具在所有输入上高效。 |
| 量词消去 | Cooper (1972) | 用于解释整数线性算术中的消元和存在量词投影；算法复杂度另行警告。 |
| 半线性等价 | Ginsburg–Spanier (1966) | 原文结论的直接域是 `ℕ^n` 上的 modified Presburger formulas；第 5 章会显式用整数坐标的正负部分/差编码搬运到 `ℤ^n`，不把单个凸多面体等同于一般半线性集合。 |
| Omega 整数判定 | Pugh, *The Omega Test* | 绑定整数仿射约束及依赖分析中的可行性检查，不泛称为任意 Presburger 工具。 |
| 最后写语义 | Feautrier (1991) | 绑定精确 flow/最后写入者；候选内存冲突只是计算最后写的输入，不是精确依赖本身。 |
| 仿射调度 | Feautrier (1992), Part I/II；Pluto/Pluto+ | 绑定依赖向前的合法调度与性能目标的区别。 |
| Farkas 约束化 | Feautrier (1992), Part I/II | 绑定在有理/实多面体上的全称非负条件的有限系数约束化；对整数实例，教程会明确采用实松弛所得的充分条件，或在需要精确性时先以整数凸包替代，绝不把普通 Farkas 说成对任意整数点集无条件等价。 |
| polyhedral scanning | Quilleré–Rajopadhye–Wilde (2000)；Bastoul (2004) | 绑定从整数点集合/调度像空间恢复嵌套循环、边界与 guard。 |
| isl 表示 | isl 官方手册 | **工具语义来源**：说明 isl 的集合、映射、schedule 与 AST 表示；数学结论仍回溯到上述论文。 |
| 代码生成语义保持 | *Verified Code Generation for the Polyhedral Model* | 用于延伸阅读与正确性视角，不将任一未证明的工程输出自动视作语义保持。 |

## 引用规则

1. 论述数学定理时，优先引用 Presburger、Cooper、Ginsburg–Spanier 等原始工作或其稳定存档。
2. 论述依赖、调度和扫描算法时，分别回溯 Feautrier、Pugh、Quilleré–Rajopadhye–Wilde 或 Bastoul。
3. 论述 isl API、对象含义或打印形式时，标为“工具语义来源”，并引用 isl 官方手册。
4. 教学中的简化符号、手算策略与例子必须明确为教学性简化；它们不得扩大来源所保证的结论。
