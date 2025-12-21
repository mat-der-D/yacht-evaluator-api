# 最大期待値戦略の計算手法の整理

この文書では、最大期待値戦略を求める数学的手法について整理する。
ゲームのルールについては [yacht-rules.md](yacht-rules.md) を参照。

## 前提

- $\mathbb{N}$: 自然数全体の集合。自然数とは $0$ 以上の整数のこと。
- $2^{X}$: 集合 $X$ のべき集合。すなわち $X$ のすべての部分集合からなる族。
- $\mathbb{R}_{\geqq 0}$: 非負実数全体の集合。
- $\mathrm{Map}(A, B)$: 集合 $A$ から集合 $B$ への写像全体の集合。
- $f \colon A \to B$ に対し、$A = \mathop\mathrm{dom} f$ および $f(A) = \mathop\mathrm{Im} f$ と書くこととする。
- 集合 $A$ に対し、$|A|$ で $A$ の元の個数を表すこととする。

## サイコロの確率論

サイコロの目の集合を $F = \{ 1, 2, 3, 4, 5, 6 \}$ とする。0個以上のサイコロを投げたときの、出た目の組み合わせは、それぞれの目で何個出たかという情報でラベリングできる。そこで $M = \mathrm{Map}(F, \mathbb{N})$ を考える。

**定義**<br>
$\omega_{1}, \omega_{2} \in M$ とする。任意の $n \in F$ に対して $\omega_{1}(n) \leqq \omega_{2}(n)$ のとき、$\omega_{1} \leqq \omega_{2}$ または $\omega_{2} \geqq \omega_{1}$ と書くこととする。

$(M, \leqq)$ は半順序集合となる。

**定義**<br>
$\omega_{1}, \omega_{2} \in M$ とする。$\omega_{1} \leqq \omega_{2}$ のとき、$\omega_{2} - \omega_{1} \in M$ を以下で定める。
$$
    (\omega_{2} - \omega_{1})(n) = \omega_{2}(n) - \omega_{1}(n)
$$

**定義**<br>
$\omega \in M$ であって任意の $n \in F$ に対して $\omega(n) = 0$ となるものを $0$ と略記する。

**定義**<br>
$\omega \in M$ に対して、$|\omega| = \sum\limits_{n \in F} \omega(n)$ と定義する。

**定義**<br>
$\omega \in M$ とする。$|\omega| > 0$ のとき、サイコロを $|\omega|$ 個振ったときに、出た目が $\omega$ に一致する確率を $P(\omega)$ とする。出た目が $\omega$ と一致するとは、各 $n \in F$ に対して、$n$ の目の個数が $\omega(n)$ 個であることをいう。$|\omega| = 0$ の場合 (すなわち $\omega = 0$ の場合) は $P(\omega) = 1$ とする。

**例**
- $\omega(1) = 2, \omega(n) = 0 \ (n \neq 1)$ の場合、$P(\omega)$ は、サイコロを2個振ってどちらも1となる確率である。すなわち $P(\omega) = \dfrac{1}{36}$ である。
- $\omega(1) = 2, \omega(2) = 1, \omega(n) = 0 \ (n \geqq 3)$ の場合、$P(\omega)$ は、サイコロを3個振って、1が2個、2が1個となる確率である。すなわち $P(\omega) = \dfrac{1}{108}$ である。
- $\omega(n) = 1 \ (n \in F)$ の場合、$P(\omega)$ は、サイコロを6個振って、すべての目が1個ずつ出る確率である。すなわち $P(\omega) = \dfrac{6!}{6^{6}}$ である。

**定理**<br>
$\omega \in M$ に対し、$P(\omega)$ は以下のように書ける。
$$
P(\omega) = \dfrac{|\omega|!}{\prod\limits_{n \in F} \omega(n)!} \cdot \dfrac{1}{6^{|\omega|}}
$$

証明および具体例での計算は読者の演習問題とする。

ヨットに利用するため、いくつかの記号を定義する。

**定義**<br>
以下のように定める。
- $\Omega = \{ \omega \in M \ | \ |\omega| = 5 \}$
- $\Omega_{\mathrm{part}} = \{ \omega \in M \ | \ |\omega| \leqq 5 \}$

$\Omega$ の元を出目パターン (dice outcome pattern), $\Omega_{\mathrm{part}}$ の元を部分出目パターン (partial dice outcome pattern) と呼ぶことにする。

**主張**<br>
$\omega \in \Omega$, $\omega' \in \Omega_{\mathrm{part}}$, $\omega \geqq \omega'$ とする。$|\omega - \omega'|$ 個のサイコロを振ったとき、出た目を $\omega'$ と組み合わせると $\omega$ となる確率は $P(\omega - \omega')$ で与えられる。

## 役 (Categories)

ヨットには12種類の役がある。これらを定義しておく。

**定義**<br>
- 数字役全体を $C_{N}$ と表記することとする。すなわち
    $$
        C_{N} = \{
            \text{エース}, \text{デュース}, \text{トレイ},
            \text{フォー}, \text{ファイブ}, \text{シックス}
        \}
    $$
- 特殊役全体を $C_{S}$ と表記することとする。すなわち
    $$
        C_{S} = \{
            \text{チョイス}, \text{フォーカード}, \text{フルハウス},
            \text{S.ストレート}, \text{B.ストレート}, \text{ヨット}
        \}
    $$
- 役全体を $C = C_{N} \cup C_{S}$ と表記することとする。

## スコア計算

それぞれの役に対して、スコアの計算方法が定まっている。

**定義**<br>
各役 $c \in C$ および $\omega \in \Omega$ に対し、$\sigma_{c}(\omega)$ を、出目パターン $\omega$ のときの役 $c$ のスコアと定義する。ただしボーナスは考慮しない。これにより $\sigma_{c} \colon \Omega \to \mathbb{N}$ が定まる。この $\sigma_{c}$ を $c$ のスコア関数と呼ぶ。

スコア計算の方法は [yacht-rules.md](yacht-rules.md) を参照。

$X \subseteq C$ および $s \colon X \to \mathbb{N}$ を考える。この $s$ は、役 $c \in X$ に対してスコア $s(c)$ を記入したスコアシートと解釈することができる。

**定義**<br>
$X \subseteq C$, $s \colon X \to \mathbb{N}$ について、各 $c \in C$ に対して $s(c) \in \mathop\mathrm{Im} \sigma_{c}$ を満たすとき、$s$ はスコアシートであるという。スコアシート全体を $S$ と表記する。

スコアシートに対してスコアを対応させる。

**定義**<br>
$s$ をスコアシートとする。$s$ のスコア $\sigma(s)$ を以下で定義する。
$$
    \sigma(s) = \sum_{c \in \mathop\mathrm{dom} s} s(c) + b(s), \quad
    b(s) = \begin{cases}
        35 & \left( \sum\limits_{c \in C_{N} \cap \mathop\mathrm{dom} s} s(c) \geqq 63 \right) \\
        0 & (\text{otherwise})
    \end{cases}
$$
$\sigma \colon S \to \mathbb{N}$ を (スコアシートの) スコア関数と呼ぶ。$b$ はボーナスに対応する。

ゲーム進行に伴って、スコアシートにはスコアが記入されていく。これを表現する記号を導入しよう。

**定義**<br>
$X$ を集合とする。$A, A' \subseteq X$ かつ $A \cap A' = \varnothing$ とする。集合 $B$ および写像 $f \colon A \to B$, $f' \colon A' \to B$ が与えられているとする。このとき写像 $f \cup f' \colon A \cup A' \to B$ を以下で定義する。
$$
    (f \cup f')(x) = \begin{cases}
        f(x) & (x \in A) \\
        f'(x) & (x \in A')
    \end{cases}
$$

$s \in S$ は $|\mathop\mathrm{dom} s| < 12$ を満たすとする。$c \in C \setminus \mathop\mathrm{dom} s$ および $v \in \mathop\mathrm{Im} \sigma_{c}$ が与えられたとすると、$s$ に対して役 $c$ にスコア $v$ を記入したシートを考えることができる。先ほどの記法を用いれば、これは $s \cup (c \mapsto v)$ と書くことができる。ただし $c \mapsto v$ は $\{ c \}$ を定義域とし、値が $v$ であるような写像である。

**定義**<br>
$n = 0, 1, 2, \dots, 12$ に対して、$S_{n} \subseteq S$ を以下で定める。
$$
    S_{n} = \{ s \in S \ | \ |\mathop\mathrm{dom} s| = n \}
$$

**主張**<br>
$n < 12$ とする。$s \in S_{n}$, $c \in C \setminus \mathop\mathrm{dom} s$, $v \in \mathop\mathrm{Im} \sigma_{c}$ に対して、$s \cup (c \mapsto v) \in S_{n + 1}$ である。

## 最大期待値戦略

以下の写像を帰納的に定義する。
- $E \colon S \to \mathbb{R}_{\geqq 0}$
- $E_{1}, E_{2}, E_{3} \colon S \times \Omega \to \mathbb{R}_{\geqq 0}$
- $E_{1}', E_{2}' \colon S \times \Omega_{\mathrm{part}} \to \mathbb{R}_{\geqq 0}$
- $E_{3}' \colon S \times \Omega \times C \to \mathbb{R}_{\geqq 0}$

まず $s \in S_{12}$ に対して
$$
    E(s) = \sigma(s)
$$
と定義する。ある $n \in \{ 1, 2, \dots, 12 \}$ に対して $E(s)$ が定義されていると仮定する。$(s, \omega, c) \in S_{n-1} \times \Omega \times C$ に対して
$$
    E'_{3}(s, \omega, c) = \begin{cases}
        E( s \cup (c \mapsto \sigma_{c}(\omega)) ) & (c \in C \setminus \mathop\mathrm{dom} s) \\
        0 & (\text{otherwise})
    \end{cases}
$$
とする。これは第 $n - 1$ ターンで、サイコロの目が $\omega$ に確定した時点で、役 $c$ を選択したときのスコアの期待値である。$c \in \mathop\mathrm{dom} s$ の場合はルール上認められないが、便宜的に $0$ としている。

次に $(s, \omega) \in S_{n - 1} \times \Omega$ に対して
$$
    E_{3}(s, \omega) = \max_{c \in C} E'_{3}(s, \omega, c)
$$
と定義する。これは期待値が最大となるように役を選んだときの期待値である。

以下, $s \in S_{n - 1}$, $\omega \in \Omega$, $\omega' \in \Omega_{\mathrm{part}}$ に対して順に定義する。
- $E'_{2}(s, \omega') = \sum\limits_{\tau \in \Omega, \tau \geqq \omega'} P(\tau - \omega') E_{3}(s, \tau)$
- $E_{2}(s, \omega) = \max\limits_{\tau' \in \Omega_{\mathrm{part}}, \tau' \leqq \omega} E'_{2}(s, \tau')$
- $E'_{1}(s, \omega') = \sum\limits_{\tau \in \Omega, \tau \geqq \omega'} P(\tau - \omega') E_{2}(s, \tau)$
- $E_{1}(s, \omega) = \max\limits_{\tau' \in \Omega_{\mathrm{part}}, \tau' \leqq \omega} E'_{1}(s, \tau')$

$E_{k}$ は第 $k$ 投で出目パターン $\omega$ が出たときに、期待値が最大となる $\omega' (\leqq \omega)$ を選んだときの期待値、$E'_{k}$ は部分出目パターン $\omega'$ のときの期待値を表す。

以上を用いて、$s \in S_{n - 1}$ に対して
$$
    E(s) = \sum_{\omega \in \Omega} P(\omega) E_{1}(s, \omega)
$$
と定義する。

$s \in S_{12}$ の場合に $E_{1}, E_{2}, E_{3}, E_{1}', E_{2}', E_{3}'$ がいずれも定義されていないが、このケースはそもそもゲームで現れないため、任意の値を設定しておけばよい。帰納的定義との整合性を考えて、いずれも $\sigma(s)$ としておく。

以上により $E, E_{1}, E_{2}, E_{3}, E'_{1}, E'_{2}, E'_{3}$ が定義された。このときの $E(0)$ の値が、最大期待値戦略での、ゲーム開始時の期待値である。

## スコアシートから定まるスコアとの差分

前節で定義した $E, E_{k}, E_{k}'$ のそれぞれについて $\sigma(s)$ を引いた量を考えてみる。これらをそれぞれ $\tilde{E}, \tilde{E}_{k}, \tilde{E}'_{k}$ とする。

まず $s \in S_{12}$ のとき、これらの値はすべて0となる。帰納的定義の式がどう変わるか確認する。以下 $s \in S \setminus S_{12}$ とする。

まず $\tilde{E}'_{3}$ から。
$$
    \tilde{E}'_{3}(s, \omega, c) = \begin{cases}
        \tilde{E}( s \cup (c \mapsto \sigma_{c}(\omega)) )
        + \tilde{\sigma}(s, c \mapsto \sigma_{c}(\omega))
          & (c \in C \setminus \mathop\mathrm{dom} s) \\
        - \sigma(s) & (\text{otherwise})
    \end{cases}
$$
ただし $\tilde{\sigma}$ はスコアの差分で、次で定義される。
$$
    \tilde{\sigma}(s, c \mapsto v)
    \coloneqq \sigma(s \cup (c \mapsto v)) - \sigma(s)
$$
次に $\tilde{E}_{3}$ はそのままの形となる。
$$
    \tilde{E}_{3}(s, \omega) = \max_{c \in C} \tilde{E}'_{3}(s, \omega, c)
$$
さらに $\omega' \in \Omega_{\mathrm{part}}$ に対して
$$
    \sum_{\tau \in \Omega, \tau \geqq \omega'} P(\tau - \omega') = 1
$$
なので、その他の式もそのまま成立する。すなわち $k = 1, 2$ および $\omega \in \Omega$, $\omega' \in \Omega_{\mathrm{part}}$ に対して、以下が成立する。
- $\tilde{E}'_{k}(s, \omega') = \sum\limits_{\tau \in \Omega, \tau \geqq \omega'}
    P(\tau - \omega') \tilde{E}_{k + 1}(s, \tau)$
- $\tilde{E}_{k}(s, \omega) = \max\limits_{\tau' \in \Omega_{\mathrm{part}}, \tau' \leqq \omega} \tilde{E}'_{k}(s, \tau')$

$\tilde{E}$ についても、
$$
    \tilde{E}(s) = \sum_{\omega \in \Omega} P(\omega) \tilde{E}_{1}(s, \omega)
$$
が成立する。ここで
$$
    \sum_{\omega \in \Omega} P(\omega) = 1
$$
を用いた。

差分についての著しい性質について述べる。

**定義**<br>
$s, s' \in S$ に対して、以下のように同値関係 $\sim$ を定義する。
$$
    s \sim s' \overset{\text{def}}{\iff}
    \mathop\mathrm{dom} s = \mathop\mathrm{dom} s'
    \land \nu(s) = \nu(s')
$$
ただし $\nu \colon S \to \mathbb{N}$ は以下で定義する。
$$
    \nu(s) = \min \left\{
        63, \sum_{c \in \mathop\mathrm{dom} s \cap C_{N}} s(c)
    \right\}
$$

これが同値関係になることの証明は、読者の演習問題とする。

**定理**<br>
$s, s' \in S$ に対し、$s \sim s'$ ならば
- $\tilde{E}(s) = \tilde{E}(s')$
- $\tilde{E}_{k}(s, \omega) = \tilde{E}_{k}(s', \omega) \quad (k = 1, 2, 3)$
- $\tilde{E}_{k}'(s, \omega') = \tilde{E}_{k}'(s', \omega') \quad (k = 1, 2)$
- $\tilde{E}_{3}'(s, \omega, c) = \tilde{E}_{3}'(s', \omega, c)$

が成立する。ただし $\omega \in \Omega$, $\omega' \in \Omega_{\mathrm{part}}, c \in C \setminus \mathop\mathrm{dom} s$ である。

**証明**<br>
帰納的定義にしたがって、数学的帰納法を用いればよい。

まず $s \sim s'$ ならば、ある $n$ が存在して $s, s' \in S_{n}$ である。$n$ について数学的帰納法を用いる。

$n = 12$ の場合は明らか。$n$ で成り立っていることを仮定して $n-1$ でも成り立っていることを見る。

$s, s' \in S_{n-1}$, $s \sim s'$ とする。$\tilde{E}'_{3}$ について、$c \in C \setminus \mathop\mathrm{dom} s$ とすると
$$
\begin{aligned}
    \tilde{E}'_{3}(s, \omega, c) 
    &= 
    \tilde{E}( s \cup (c \mapsto \sigma_{c}(\omega)) )
        + \tilde{\sigma}(s, c \mapsto \sigma_{c}(\omega)) \\
    &=
    \tilde{E}( s' \cup (c \mapsto \sigma_{c}(\omega)) )
        + \tilde{\sigma}(s', c \mapsto \sigma_{c}(\omega)) \\
    &= \tilde{E}'_{3}(s', \omega, c)
\end{aligned}
$$
が成立する。ただし2つ目の等式では、第1項については帰納法の仮定を、第2項については
$$
\begin{aligned}
    \tilde{\sigma}(s, c \mapsto \sigma_{c}(\omega))
    &= \sigma_{c}(\omega) + \begin{cases}
        35 & (c \in C_{N} \land \nu(s) < 63 \land \nu(s) + \sigma_{c}(\omega) \geqq 63) \\
        0 & (\text{otherwise})
    \end{cases}
\end{aligned}
$$
であることを用いた。他は自明である。$\square$

したがって、差分の関数は ($\tilde{E}'_{3}$ の $c \in \mathop\mathrm{dom} s$ の元を除けば) $S / {}\sim{}$ 上の関数として well-defined である。

さらに $s \in S$ に対して $\sigma(s)$ の計算は容易なので、$S / {}\sim{}$ 上の差分の関数の値から元の期待値を復元することも容易である。

## 解析済みデータと追加計算の配分

$S / {}\sim{}$ 上の関数 $\tilde{E}(s)$ をデータとして保存し、他の量は計算で求める方法について整理しておく。

まず $| S / {}\sim{}| = 2^{12} \times 64 = 2^{18}$ である。$\tilde{E}(s)$ の値は $\mathbb{R}_{\geqq 0}$ なので、例えば32bit浮動小数点数で保持するとすると、データ部のサイズは $4 \times 2^{18} = 2^{20}$ bytesである。これは1MBであり、かなりコンパクトである。

局面評価プログラムの作成を念頭に、$\tilde{E}(s)$ のデータを元に各種データを求める手順を整理する。

局面評価のときの関心事は、以下の通りである。
- 1投目・2投目の直後に、どのサイコロを残すべきか？
- 3投目の直後に、どの役に確定すべきか？

これらの情報は $E'_{k}$ により与えられる情報に相当する。そこで $E'_{k}$ を求める手法を整理しておく。

以下、スコアシートは $s \in S$ であるとする。ゲーム進行中と仮定して $s \notin S_{12}$ とする。また出目パターンは $\omega \in \Omega$ であるとする。

### $E'_{3}$ の求め方

各 $c \in C \setminus \mathop\mathrm{dom} s$ について、それぞれの期待値を求めたい。

まず $\tilde{E}'_{3}$ を求める。各 $c \in C \setminus \mathop\mathrm{dom} s$ に対して以下を計算する。
$$
    \tilde{E}'_{3}(s, \omega, c)
    = \tilde{E}( s \cup (c \mapsto \sigma_{c}(\omega)) )
        + \tilde{\sigma}(s, c \mapsto \sigma_{c}(\omega))
$$
第一項は計算済みデータから取得する。第二項は以下で計算する。
$$
\begin{aligned}
    \tilde{\sigma}(s, c \mapsto \sigma_{c}(\omega))
    &= \sigma_{c}(\omega) + \begin{cases}
        35 & (c \in C_{N} \land \nu(s) < 63 \land \nu(s) + \sigma_{c}(\omega) \geqq 63) \\
        0 & (\text{otherwise})
    \end{cases}
\end{aligned}
$$
これにより計算が求まる。計算量は $O(|C \setminus \mathop\mathrm{dom} s|) \leqq O(12)$ 程度。

実際の期待値を求めるには
$$
    E'_{3}(s, \omega, c) = \tilde{E}'_{3}(s, \omega, c) + \sigma(s)
$$
と計算すればよい。

### $E'_{2}$ の求め方

各 $\omega' \in \Omega_{\mathrm{part}}, \omega' \leqq \omega$ に対して、それぞれの期待値を求めたい。

$\tilde{E}'_{3}$ は事前にすべての $(\omega, c) \in \Omega \times (C \setminus \mathop\mathrm{dom} s)$ に対して求めておく。これは $252 \times 12 = 3,024$ 通り程度。

次に $\tilde{E}_{3}$ を以下で計算する。
$$
    \tilde{E}_{3}(s, \omega) = \max_{c \in C \setminus \mathop\mathrm{dom} s} \tilde{E}'_{3}(s, \omega, c)
$$
これは $\tilde{E}'_{3}$ を求める処理の中で扱えるので、追加の計算量は無視できる。

次に $\tilde{E}'_{2}$ を以下で計算する。
$$
    \tilde{E}'_{2}(s, \omega')
    = \sum_{\tau \in \Omega, \tau \geqq \omega'}
        P(\tau - \omega') \tilde{E}_{3}(s, \tau)
$$
計算回数は $\omega$ に対して $\omega' \leqq \omega$ となる $\omega'$ の個数分である。これは $\omega$ にかなり依存するが、最も多いケースで $2^{5} = 32$ 通りである。

最後に $E'_{2}$ は
$$
    E'_{2}(s, \omega') = \tilde{E}'_{2}(s, \omega') + \sigma(s)
$$
で求められる。トータルの計算回数は $3,024 \times 32 = 96,768$ 程度。

### $E'_{1}$ の求め方

$\tilde{E}'_{2}$ を各 $\omega' \in \Omega_{\mathrm{part}}$ に対して求めておく。$\omega'$ は461通りあるので、これの計算量は $3,024 \times 461 = 1,394,064$ 回程度。

次に $\tilde{E}_{2}$ を以下で計算する。
$$
    \tilde{E}_{2}(s, \omega)
    = \max_{\tau' \in \Omega_{\mathrm{part}}, \tau' \leqq \omega}
        \tilde{E}'_{2}(s, \tau')
$$
ややテクニカルではあるが、事前計算を上手にしておけば、ここは追加計算は無視できる量である。

次に $\tilde{E}'_{1}$ を以下で計算する。
$$
    \tilde{E}'_{1}(s, \omega')
    = \sum_{\tau \in \Omega, \tau \geqq \omega'}
        P(\tau - \omega') \tilde{E}_{2}(s, \tau)
$$
これは与えられた $\omega$ に対して $\omega' \leqq \omega$ なる $\omega'$ に対して行えば良いから、高々 $32$ 回程度である。

最後に $E'_{1}$ は
$$
    E'_{1}(s, \omega') = \tilde{E}'_{1}(s, \omega') + \sigma(s)
$$
で求められる。トータルの計算回数は $1,394,064 \times 32 = 44,610,048$ 回程度。