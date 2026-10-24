이번 수업에서는 점수 목록을 함수에 전달해 합계, 평균, 기준 점수 이상인 사람 수를 구합니다. 함수가 목록 전체를 새로 보관할 필요는 없습니다. 기존 목록을 읽고 계산한 결과만 돌려주면 됩니다. 이때 쓸 도구가 `const` 참조 매개변수와 값 반환입니다.

앞 수업에서 함수의 값 매개변수, 지역 변수, 선언과 정의를 배웠습니다. `std::string`, `std::vector`, 범위 기반 `for`, 기초적인 `auto`도 알고 있다고 가정합니다. 이번에는 참조를 처음 소개합니다. 포인터, 사용자 정의 자료형, 함수 템플릿, 예외 처리는 필요하지 않습니다. 코드에 등장하는 `std::vector<int>`는 이미 배운 정수 목록으로 사용합니다.

수업을 마치면 다음을 할 수 있어야 합니다.

- 값을 복사한 변수와 기존 변수에 연결된 참조를 구분합니다.
- `const std::vector<int>&`를 읽고, 이 매개변수를 받는 함수를 작성합니다.
- 자료를 읽는 일과 계산 결과를 반환하는 일을 구분합니다.
- 빈 자료와 입력 범위를 검사한 뒤 안전하게 평균을 계산합니다.
- 지역 변수의 값 반환과 지역 변수의 참조 반환이 왜 다른지 설명합니다.

## 1 복사한 값과 같은 대상을 부르는 이름

먼저 함수 없이 참조를 살펴봅시다.

```cpp
int score = 72;
int copied = score;
int& sameScore = score;
```

첫 줄은 정수 변수 `score`를 만듭니다. 둘째 줄은 `score`의 현재 값으로 별도 변수 `copied`를 초기화합니다. 두 변수의 초기 값이 같다고 해서 같은 변수인 것은 아닙니다. `copied`에 40을 대입해도 `score`는 그대로입니다.

셋째 줄의 `int&`는 **정수에 대한 참조**를 나타냅니다. 여기의 `&`는 타입 선언의 일부입니다. 지금은 다른 용도로 쓰이는 `&`까지 외울 필요가 없습니다. `sameScore`는 `score`를 가리키도록 초기화된 참조입니다. 이번 수업에서는 기존 대상에 붙인 또 다른 이름이라고 생각하면 이해하기 쉽습니다.

`sameScore = 85;`를 실행하면 참조가 연결된 대상인 `score`의 값이 85가 됩니다. 별도의 정수 복사본을 바꾼 것이 아닙니다. 이 차이를 직접 확인해 보겠습니다.

### 완전 실행 예제 1 참조의 이름

파일: `examples/01_reference_names.cpp`

```cpp
#include <iostream>

int main()
{
    int score = 72;
    int copied = score;
    int& sameScore = score;

    copied = 40;
    sameScore = 85;

    std::cout << score << " " << copied << " " << sameScore << std::endl;

    int other = 60;

    sameScore = other;
    other = 90;

    std::cout << score << " " << other << " " << sameScore << std::endl;
}
```

예상 출력:

```text
85 40 85
60 90 60
```

첫 출력에서는 `score`와 `sameScore`가 모두 85입니다. 둘째 출력이 더 중요합니다. `sameScore = other;`는 참조의 대상을 `other`로 갈아 끼우는 문장이 아닙니다. `other`의 현재 값 60을 기존 대상 `score`에 대입합니다. 그 뒤 `other`를 90으로 바꾸어도 `score`와 `sameScore`는 60입니다.

참조는 만들 때 대상을 정해야 하고, 초기화한 뒤 다른 대상을 참조하도록 재지정할 수 없습니다. 참조에 대입하는 문장은 대상에 대입하는 문장입니다. 다음 둘을 구분하세요.

- `int& sameScore = score;`: 참조를 만들면서 대상과 연결합니다.
- `sameScore = other;`: 이미 연결된 대상에 값을 대입합니다.

참조를 변수 이름처럼 사용할 수 있다는 사실과 참조가 별도 값 복사본이라는 생각을 혼동하지 마세요. 이 수업에서는 참조 자체의 크기나 구현 방식을 설명하지 않습니다. 중요한 것은 어떤 대상을 읽고 쓰는지입니다. 참조 초기화와 대입의 의미는 [C++20 작업 초안 N4861의 참조 초기화 절 `[dcl.init.ref]`](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2020/n4861.pdf)에 규정되어 있습니다.

### 잠깐 확인

`score`가 60이고 `sameScore`가 이를 참조할 때 `sameScore += 5;`를 실행하면 `score`는 얼마일까요? 65입니다. 이름이 둘이어도 이번 연산이 바꾸는 정수 대상은 하나입니다.

## 2 읽기만 허용하는 참조

점수 목록의 합계를 구하는 함수가 원본 점수를 바꾸면 곤란합니다. 참조를 사용하면 원본에 접근할 수 있지만, 합계 함수에는 읽기 권한만 주면 충분합니다.

```cpp
int score = 72;
const int& readOnly = score;
```

`const int&`는 `int`를 읽기 전용으로 바라보는 참조입니다. `readOnly`를 통해 값을 읽을 수는 있지만 `readOnly = 90;`처럼 수정할 수는 없습니다. 다음 문장은 서로 다릅니다.

```cpp
score = 90;               // 가능: 원래 변수는 const가 아닙니다.
std::cout << readOnly << std::endl; // 90
```

`readOnly`는 72의 사진을 따로 보관한 것이 아닙니다. 같은 대상을 계속 봅니다. 다른 허용된 경로인 `score`를 통해 대상이 바뀌면, 참조로 읽는 값도 바뀝니다.

따라서 “`const` 참조를 만들면 원본이 어디에서나 불변이 된다”라는 설명은 정확하지 않습니다. `const` 참조는 **그 참조를 통한 수정**을 제한합니다. 원본 변수 자체가 `const`라면 원본도 수정할 수 없지만, 그것은 원본 선언의 성질입니다. 이 둘은 구분해야 합니다.

목록에도 같은 생각을 적용합니다.

```cpp
std::vector<int> scores{40, 70, 90};
const std::vector<int>& view = scores;
```

`view`를 만들 때 점수 세 개를 가진 새 목록을 복사하여 만들지 않습니다. `view`는 `scores`라는 기존 목록에 연결됩니다. `view[0]`을 읽을 수 있지만 `view[0] = 100;`은 허용되지 않습니다. 이 수업의 `std::vector<int>`에서는 원소 변경뿐 아니라 `view.push_back(100);`처럼 목록 내용을 바꾸는 작업도 할 수 없습니다.

한편 `scores[0] = 50;`은 가능합니다. 이때 `view[0]`으로 읽으면 50이 나옵니다. 원본과 참조의 관계는 유지되고, 읽기 전용이라는 제한도 유지됩니다. [Microsoft의 `const` 설명](https://learn.microsoft.com/en-us/cpp/cpp/const-cpp?view=msvc-170)

## 3 참조를 함수의 매개변수에 사용하기

값 매개변수를 받는 다음 선언을 떠올려 봅시다.

```cpp
int sumScores(std::vector<int> scores);
```

이미 존재하는 `std::vector<int>` 변수를 인수로 넘기면 매개변수는 별도의 목록으로 초기화됩니다. 함수가 그 매개변수의 원소를 바꾸어도 호출자가 가진 원래 목록을 바꾸는 것은 아닙니다. 함수가 자체 목록을 필요로 한다면 의미 있는 선택입니다. 하지만 합계 계산처럼 읽기만 할 목적이라면 목록 전체의 복사본이 필요하지 않습니다.

이번 수업에서는 다음과 같이 선언합니다.

```cpp
int sumScores(const std::vector<int>& scores);
```

오른쪽부터 단어를 억지로 번역하기보다는 다음 세 부분을 확인하세요.

1. `std::vector<int>`: 정수 목록을 다룹니다.
2. `&`: 기존 대상에 대한 참조로 받습니다.
3. `const`: 이 매개변수를 통해 목록을 수정하지 않습니다.

호출하는 문법은 그대로입니다.

```cpp
const int total = sumScores(scores);
```

호출할 때 별도의 기호를 붙이지 않습니다. 참조 매개변수인지 아닌지는 함수 선언에서 결정됩니다. 함수 안에서는 `scores`라는 이름으로 인수의 목록을 읽습니다. 호출자도 자기 목록을 `scores`라고 이름 붙일 수 있지만, 두 위치의 철자가 같아야 연결되는 것은 아닙니다. 인수로 전달했다는 관계가 중요합니다.

### 완전 실행 예제 2 같은 목록을 읽는 함수

파일: `examples/02_const_view.cpp`

```cpp
#include <iostream>
#include <vector>

int sumScores(const std::vector<int>& scores)
{
    int total = 0;

    for (int score : scores) {
        total += score;
    }

    return total;
}

int main()
{
    std::vector<int> scores{40, 70, 90};
    const std::vector<int>& view = scores;

    std::cout << sumScores(view) << std::endl;

    scores[0] = 50;
    std::cout << sumScores(view) << std::endl;

    const std::vector<int> fixedScores{80, 100};

    std::cout << sumScores(fixedScores) << std::endl;
}
```

예상 출력:

```text
200
210
180
```

`sumScores` 안의 `total`은 매번 새로 만들어지는 지역 변수입니다. `score`도 반복마다 원소의 값을 받는 지역 변수입니다. 함수는 `scores`를 읽고, 자기 지역 변수 `total`만 바꿉니다. 마지막에는 `total`의 값을 반환합니다.

첫 호출의 합계는 200입니다. `main`에서 원본 첫 점수를 40에서 50으로 바꾼 뒤 같은 참조를 넘기면 210이 나옵니다. `const` 참조가 옛 상태를 저장한 복사본이 아니라는 증거입니다.

마지막 호출은 원본 자체가 `const`인 목록을 전달합니다. 읽기만 요구하는 함수이므로 이 목록도 받을 수 있습니다. 이 함수는 수정 가능한 목록과 수정 불가능한 목록을 모두 읽을 수 있습니다. 반면 `std::vector<int>&`처럼 `const`가 없는 참조 매개변수는 수정 가능한 대상이 필요하며, 함수가 원본을 바꿀 가능성을 갖는 인터페이스입니다. 이번 통계 함수에는 필요하지 않습니다.

<figure class="concept-figure">
<a href="/cpp-jeongseok/assets/illustrations/02-4-read-data.webp"><img src="/cpp-jeongseok/assets/illustrations/02-4-read-data.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="40, 70, 90이 적힌 원본 점수표 하나를 계산기가 읽고, 별도 결과 화면에 합계 200을 표시합니다."></a>
<div class="figure-example"><strong>같은 점수 목록을 읽고 합계 반환</strong><ul><li>scores: 40 · 70 · 90 → sumScores(view) → 200</li><li>const <code>std::vector</code>&lt;<code>int</code>&gt;&amp;는 기존 목록을 읽는 참조 매개변수입니다.</li><li>scores[0]을 50으로 바꾸면 같은 view로 계산한 합은 210입니다. const 참조는 복사·스냅샷이 아니며 그 참조를 통한 수정을 막습니다.</li></ul></div>
<figcaption>AI 생성 개념 일러스트. 원본 점수 목록을 읽어 합계를 계산한 뒤 별도의 결과값을 돌려줍니다. 원본 목록을 복사하거나 참조를 별도 데이터로 만드는 과정은 아닙니다.</figcaption>
</figure>

그림은 기존 자료를 읽어 결과를 만드는 관계를 나타낸 비유입니다. 참조를 만들 때 목록을 하나 더 복사하는 것은 아니며, `const` 참조를 통한 수정은 허용되지 않습니다. 그림 속 상자나 도구는 메모리 배치나 실제 프로그램 객체의 개수를 뜻하지 않습니다.

### 작은 값까지 모두 참조로 바꾸어야 할까요

아닙니다. `int threshold`처럼 작은 설정값은 값으로 전달해도 자연스럽습니다. 이번 수업의 기준은 “무조건 참조가 빠르다”가 아닙니다. 자료 목록을 읽는 함수라는 의도를 드러내면서, 그 목록을 매개변수용으로 복사하지 않는 것입니다. 실제 성능은 자료, 작업, 빌드 조건 등에 따라 확인해야 합니다.

## 4 계산한 결과는 값으로 돌려주기

함수에는 들어오는 자료와 나가는 결과가 있습니다. 두 방향의 전달 방식이 같아야 하는 것은 아닙니다.

```cpp
int countAtLeast(const std::vector<int>& scores, int threshold);
```

이 선언은 다음처럼 읽습니다. 목록은 읽기 전용 참조로 받고, 기준 점수는 값으로 받으며, 기준 이상인 원소의 개수는 정수 값으로 돌려줍니다. `scores`와 `threshold`는 입력이고 반환값은 계산 결과입니다.

지역 변수 `count`를 만들어 0부터 세면 됩니다. 자료가 100개 이하라면 `count`도 0부터 100 사이입니다. `score >= threshold`라는 조건에서 `>=`를 썼으므로 기준과 같은 점수도 포함됩니다. 함수 이름도 이 의미를 담아 `countAtLeast`라고 정했습니다.

문자열도 값으로 반환할 수 있습니다. 결과 문구를 만드는 함수가 지역 문자열을 만든 뒤 `return text;`라고 쓰는 것은 안전한 사용법입니다. 반환 타입이 `std::string`이면 호출자가 사용할 결과 문자열을 값으로 반환합니다. 함수 종료 후 사라지는 지역 변수에 대한 참조를 돌려주는 것이 아닙니다.

### 완전 실행 예제 3 개수와 문구 반환

파일: `examples/03_return_values.cpp`

```cpp
#include <iostream>
#include <string>
#include <vector>

int countAtLeast(const std::vector<int>& scores, int threshold)
{
    int count = 0;

    for (int score : scores) {
        if (score >= threshold) {
            ++count;
        }
    }

    return count;
}

std::string makeSummary(int count)
{
    std::string text = "Reached target: ";

    text += std::to_string(count);

    return text;
}

int main()
{
    const std::vector<int> scores{65, 80, 95, 80};

    const int count = countAtLeast(scores, 80);
    std::string summary = makeSummary(count);

    summary += " students";

    std::cout << summary << std::endl;
    std::cout << scores[0] << std::endl;
}
```

예상 출력:

```text
Reached target: 3 students
65
```

여기에서 `std::to_string(count)`는 정수를 문자열로 바꿉니다. 3이라는 계산 결과를 `"3"`이라는 문자열로 만들어 문구에 붙입니다. 이를 사용하려고 `<string>`을 포함했습니다. 문자열 변환의 모든 종류를 외울 필요는 없습니다.

`makeSummary`의 지역 변수 `text`는 함수 실행 중에만 이름을 사용할 수 있습니다. 그러나 반환된 결과를 받은 `summary`는 `main`의 변수입니다. 여기에 `" students"`를 붙여도 됩니다. 원래 점수 목록은 그대로이므로 마지막 줄에 65가 출력됩니다.

**값 반환은 결과를 받는 의미를 설명하는 말이지, 언제나 별도 복사 작업이 반드시 발생한다는 약속이 아닙니다.** C++에서는 조건에 따라 복사·이동이 생략되거나 이동이 사용될 수 있습니다. 지금은 그 세부 규칙보다 올바른 반환 타입을 선택하는 것이 우선입니다. 성능을 추측해서 지역 문자열을 참조로 반환하지 마세요. [N4861 `[stmt.return]`, `[class.copy.elision]`](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2020/n4861.pdf)

## 5 참조 반환과 수명을 혼동하지 않기

다음 코드는 실행하지 마세요. 앞 예제를 개선한 코드가 아니라 수명 문제가 있는 코드입니다.

```cpp
const int& wrongTotal()
{
    int total = 100;

    return total; // 잘못된 설계: 지역 변수에 대한 참조 반환
}
```

반환 타입이 `int`가 아니라 `const int&`입니다. 반환하려는 것은 100이라는 결과 값이 아니라 지역 변수 `total`에 연결된 참조입니다. 일반적인 자동 지역 변수 `total`의 수명은 함수가 끝나면서 종료됩니다. 호출자가 반환된 참조로 그 값을 읽으려 할 때는 유효한 대상이 남아 있지 않습니다.

이러한 참조를 흔히 댕글링 참조라고 부릅니다. 그 참조를 사용해 이미 수명이 끝난 대상을 읽는 동작에는 올바른 출력값을 약속할 수 없습니다. “항상 0이 나온다”, “무조건 실행 오류가 난다”, “한 번 100이 나왔으니 안전하다” 모두 틀린 판단입니다. 경고가 나올 수 있지만, 컴파일 성공 자체가 안전하다는 뜻도 아닙니다. MSVC는 이런 사례에 C4172 경고를 제시합니다. [Microsoft의 참조 반환 설명](https://learn.microsoft.com/en-us/cpp/cpp/reference-type-function-returns?view=msvc-170)

이번 경우의 해결책은 단순합니다.

```cpp
int safeTotal()
{
    int total = 100;

    return total;
}
```

`const`를 붙인다고 대상의 수명이 자동으로 늘어나는 것은 아닙니다. 이미 존재하는 지역 변수의 수명을 참조가 보장해 주지 않습니다. 임시 객체와 참조 사이에는 별도의 수명 규칙이 있지만, 그 규칙을 “참조는 대상을 언제까지나 살려 둔다”로 일반화하면 안 됩니다. 특히 위의 잘못된 지역 참조 반환은 `const`로 해결되지 않습니다.

이번 수업의 안전한 패턴은 **살아 있는 호출자의 목록을 함수 실행 중에 읽고, 계산한 결과를 값으로 반환하기**입니다. 참조를 따로 저장하거나 함수 밖으로 전달해 오래 사용하지 않습니다. 이런 범위만 지켜도 지금 필요한 통계 함수를 충분히 만들 수 있습니다.

## 6 통계 함수의 입력 조건 정하기

이제 점수를 입력받는 프로그램을 만듭니다. 먼저 허용할 자료를 정합니다.

- 점수는 정수이며 0 이상 100 이하입니다.
- 점수 개수는 0 이상 100 이하입니다.
- 빈 목록의 합계와 기준 이상 개수는 모두 0입니다.
- 빈 목록의 평균은 계산하지 않고 “자료 없음”으로 표시합니다.

범위를 먼저 정하는 이유는 계산의 안전성을 설명할 수 있기 때문입니다. 가장 큰 합계는 `100 × 100 = 10000`입니다. 가장 작은 합계는 0입니다. 이번 범위에서는 `int`로 합계를 담을 수 있습니다. 반대로 정수를 제한 없이 계속 읽어 더하는 코드에 같은 설명을 그대로 적용하면 안 됩니다. 더 넓은 용도로 바꿀 때는 개수와 점수 범위, 합계 타입을 다시 검토해야 합니다.

이 프로그램에서 입력 검사는 `main`이 맡습니다. 통계 함수들은 이미 검증된 목록을 받는다고 약속합니다. 함수 호출 전에 만족해야 하는 이런 조건을 **사전 조건**이라고 부릅니다. 별도의 C++ 문법이 아니라 함수를 올바르게 쓰기 위한 약속입니다.

`sumScores`와 `countAtLeast`는 빈 목록을 받아도 됩니다. 반복문을 한 번도 실행하지 않아서 초기값 0을 반환합니다. `averageScore`에는 추가 조건이 있습니다. 목록이 비어 있지 않아야 합니다. `main`이 `empty()`를 확인하고, 비어 있지 않은 가지에서만 이 함수를 호출합니다.

평균이 필요하지 않은 상황에서 억지로 0을 반환하게 만들지 않는 이유도 생각해 보세요. 점수 하나가 0인 목록의 평균은 실제로 0입니다. 빈 목록에는 평균을 낼 점수가 없습니다. 두 상태를 같은 숫자로 표현하면 사용자가 차이를 알기 어렵습니다. 여기서는 반환 타입을 복잡하게 바꾸는 대신 호출 전에 구분합니다.

### 평균 계산에서 나눗셈 확인하기

정수 합계 161을 정수 개수 2로 나누면 정수 나눗셈의 결과는 80입니다. 반환 타입이 `double`이라고 써 있어도 이미 사라진 소수 부분이 복원되지는 않습니다.

```cpp
const double count = static_cast<double>(scores.size());

return total / count;
```

`static_cast<double>(...)`는 괄호 안의 값을 `double` 값으로 변환하겠다는 표현입니다. 여기에서는 개수를 실수로 바꿉니다. 나눗셈의 한쪽이 `double`이므로 161과 2의 평균 80.5를 얻습니다. `scores.size()`의 원래 타입을 외우거나 억지로 `int`로 줄일 필요는 없습니다.

## 7 완성 프로그램과 실행 흐름

### 완전 실행 예제 4 점수 통계

파일: `examples/04_statistics.cpp`

```cpp
#include <iomanip>
#include <iostream>
#include <vector>

// Preconditions: at most 100 scores, each in [0, 100].
int sumScores(const std::vector<int>& scores);
int countAtLeast(const std::vector<int>& scores, int threshold);

// Additional precondition: scores is not empty.
double averageScore(const std::vector<int>& scores);

int main()
{
    int count = 0;

    std::cout << "Count (0..100):" << std::endl;
    if (!(std::cin >> count)) {
        std::cout << "Input error." << std::endl;
        return 1;
    }

    if (count < 0 || count > 100) {
        std::cout << "Count out of range." << std::endl;
        return 1;
    }

    std::vector<int> scores;

    for (int index = 0; index < count; ++index) {
        int score = 0;

        std::cout << "Score " << index + 1 << " (0..100):" << std::endl;
        if (!(std::cin >> score)) {
            std::cout << "Input error." << std::endl;
            return 1;
        }

        if (score < 0 || score > 100) {
            std::cout << "Score out of range." << std::endl;
            return 1;
        }

        scores.push_back(score);
    }

    std::cout << "Count: " << scores.size() << std::endl;
    std::cout << "Total: " << sumScores(scores) << std::endl;
    std::cout << "At least 80: " << countAtLeast(scores, 80) << std::endl;

    if (scores.empty()) {
        std::cout << "Average: no data" << std::endl;
    } else {
        std::cout << std::fixed << std::setprecision(1);
        std::cout << "Average: " << averageScore(scores) << std::endl;
    }
}

int sumScores(const std::vector<int>& scores)
{
    int total = 0;

    for (int score : scores) {
        total += score;
    }

    return total;
}

int countAtLeast(const std::vector<int>& scores, int threshold)
{
    int count = 0;

    for (int score : scores) {
        if (score >= threshold) {
            ++count;
        }
    }

    return count;
}

double averageScore(const std::vector<int>& scores)
{
    const int total = sumScores(scores);
    const double count = static_cast<double>(scores.size());

    return total / count;
}
```

입력 예시:

```text
4
65 80 95 80
```

프로그램 출력:

```text
Count (0..100):
Score 1 (0..100):
Score 2 (0..100):
Score 3 (0..100):
Score 4 (0..100):
Count: 4
Total: 320
At least 80: 3
Average: 80.0
```

위 출력에는 사용자가 입력해서 콘솔에 보인 문자를 섞지 않았습니다. 실제 콘솔에서는 안내문 사이에 입력한 숫자가 함께 보일 수 있습니다. 파일이나 테스트 도구로 입력하면 안내문만 연속으로 나타납니다.

함수 선언은 `main`보다 앞에, 함수 정의는 뒤에 두었습니다. 앞 수업의 선언과 정의를 다시 사용하는 배치입니다. 선언과 정의에서 매개변수 타입이 일치하는지 확인하세요. 한쪽의 `&`를 빠뜨리면 같은 함수를 제대로 정의한 것이 아니게 될 수 있습니다.

프로그램의 흐름은 다음과 같습니다.

1. 개수를 읽습니다. 정수 추출에 실패하면 오류를 알리고 종료합니다.
2. 개수가 0부터 100 사이인지 확인합니다.
3. 각 점수를 읽고 범위를 검사한 뒤 목록에 추가합니다.
4. 완성된 목록을 통계 함수에 넘겨 합계와 인원수를 구합니다.
5. 빈 목록이면 평균 함수를 호출하지 않습니다. 비어 있지 않으면 평균을 출력합니다.

`if (!(std::cin >> count))`는 입력이 정수로 성공적으로 추출되었는지 검사하는 관용적인 형태입니다. 숫자가 아닌 입력이나 입력 종료로 읽을 수 없으면 오류 가지로 들어갑니다. 초기값을 0으로 두었다는 이유만으로 실패한 입력을 정상적인 0으로 취급하지 않습니다.

이 예제는 잘못된 입력이 있으면 종료합니다. 입력 상태를 복구하고 다시 입력받는 기능은 넣지 않았습니다. 또한 `>>`는 공백으로 구분된 정수를 추출하는 방식입니다. 한 줄 전체가 완벽한 정수 표기인지 검사하는 입력 검증기는 아닙니다. 예를 들어 숫자 뒤에 문자가 붙은 토큰은 숫자 부분을 먼저 읽을 수 있습니다. 학습자는 정수 토큰을 입력한다고 가정하고, 전용 문자열 파싱은 뒤의 과제로 남깁니다.

`std::fixed`와 `std::setprecision(1)`은 이 예제에서 소수점 아래 한 자리까지 출력하도록 설정합니다. 이를 위해 `<iomanip>`을 포함했습니다. 출력 형식이 바뀌는 것이지, 함수가 계산한 `double` 결과를 정수로 바꾸는 것은 아닙니다.

### 입력과 계산을 나눈 이유

`sumScores` 안에는 `std::cin`이나 `std::cout`이 없습니다. 그래서 사용자가 입력한 목록뿐 아니라 코드에 직접 적은 목록도 같은 함수로 처리할 수 있습니다. 함수에 어떤 자료를 주었을 때 어떤 값이 나오는지도 확인하기 쉽습니다.

목록을 합계, 개수, 평균 계산에 여러 번 순회한다는 점도 보일 것입니다. 이 수업에서는 최대 100개의 점수를 다루고 각 함수의 역할을 분명하게 나누는 데 집중합니다. 이를 실제 성능 측정 없이 “가장 빠른 구조”라고 부르지는 않습니다. 여러 결과를 한 번의 순회에서 묶어 반환하는 설계는 다른 자료형을 배운 뒤 검토할 수 있습니다.

## 8 빈 자료와 경계값으로 확인하기

평범한 예제 한 번만 실행하면 조건문 일부는 확인하지 못합니다. 특히 이번 수업에서는 빈 입력과 최댓값을 직접 확인해야 합니다.

개수로 `0`을 입력하면 점수를 묻는 반복문을 건너뜁니다. 요약 출력은 다음과 같습니다.

```text
Count: 0
Total: 0
At least 80: 0
Average: no data
```

여기에서는 `averageScore`를 호출하지 않습니다. “빈 평균을 계산한 다음 화면에서 숨긴다”가 아닙니다. 호출 자체가 비어 있지 않은 경우에만 일어나므로 0으로 나누는 경로를 피합니다.

개수 1과 점수 0을 입력하면 평균은 `0.0`입니다. 빈 목록과 분명하게 구별됩니다. 개수 2와 점수 80, 81을 입력하면 합계는 161, 평균은 `80.5`입니다. 소수 부분이 나오는 테스트가 있어야 정수 나눗셈 실수를 잡을 수 있습니다.

개수 100과 점수 100을 100번 입력하면 합계는 10000, 기준 이상 개수는 100, 평균은 `100.0`입니다. 이는 허용 범위의 최대 합계와 반복 횟수를 확인합니다. 개수 101은 애초에 거부하고 점수 입력을 시작하지 않아야 합니다.

점수 -1이나 101은 `Score out of range.`를 출력하고 종료해야 합니다. `x`처럼 정수 추출에 실패하는 입력은 `Input error.`로 처리합니다. 두 종류의 실패는 다릅니다. 하나는 읽을 수 있는 정수지만 허용 범위를 벗어났고, 다른 하나는 필요한 정수를 읽지 못했습니다.

실패한 경우에는 불완전한 목록의 통계를 출력하지 않습니다. 앞 점수 몇 개가 정상이어도 프로그램은 곧바로 종료합니다. 잘못된 자료를 조용히 버리고 남은 자료로 평균을 내는 것과는 다른 정책입니다. 프로그램을 바꿀 때는 어떤 정책인지 먼저 정해야 합니다.

검사할 때는 출력 문구뿐 아니라 종료 상태도 확인할 수 있습니다. 이 예제는 입력 실패에 `return 1;`을 사용하고, 정상적으로 `main`의 끝에 도달하면 성공 종료합니다. 모든 프로그램의 오류 코드가 반드시 1이어야 한다는 뜻은 아닙니다.

## 9 auto를 쓰더라도 참조 여부는 확인하기

앞 수업에서 `auto`는 초기값을 보고 타입을 추론한다고 배웠습니다. 그렇다고 초기값의 참조 성질이 선언에 항상 그대로 붙는 것은 아닙니다.

```cpp
const std::vector<int>& view = scores;
auto copy = view;
const auto& readOnly = view;
```

여기에서 `copy`는 별도 `std::vector<int>` 값입니다. 초기값이 참조를 통해 표현되었다고 해서 새 변수까지 자동으로 참조가 되지 않습니다. `copy[0]`을 바꾸어도 원본은 바뀌지 않습니다.

`readOnly`는 선언에 `&`를 썼으므로 읽기 전용 참조입니다. 자료를 새 목록으로 보관하지 않고 원래 목록을 읽습니다. “`auto`가 있으니 타입을 보지 않아도 된다”보다 “`auto` 주변의 `const`와 `&`도 함께 읽는다”가 올바른 습관입니다.

### 완전 실행 예제 5 auto와 복사

파일: `examples/05_auto_and_reference.cpp`

```cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> scores{60, 80};
    const std::vector<int>& view = scores;
    auto copy = view;
    const auto& readOnly = view;

    copy[0] = 10;
    scores[1] = 95;

    std::cout << copy[0] << " " << copy[1] << std::endl;
    std::cout << readOnly[0] << " " << readOnly[1] << std::endl;

    for (auto value : scores) {
        value = 0;
        std::cout << value << " ";
    }

    std::cout << std::endl;
    std::cout << scores[0] << " " << scores[1] << std::endl;
}
```

예상 출력:

```text
10 80
60 95
0 0 
60 95
```

셋째 줄의 마지막 0 뒤에는 공백 하나가 있습니다. 반복문 안에서 각 값과 공백을 출력했기 때문입니다.

`copy`는 만들어질 때 두 값 60과 80을 별도로 보관합니다. 그 뒤 원본 둘째 값을 95로 바꾸어도 `copy`의 둘째 값은 80입니다. 반대로 `readOnly`는 원본을 바라보므로 60과 95를 출력합니다.

마지막 반복문의 `auto value`는 각 정수 원소를 복사한 지역 변수입니다. `value = 0;`은 그 지역 변수만 바꿉니다. 마지막에 출력한 원본이 60과 95로 남는 이유입니다. 읽기만 하는 정수 순회에서는 앞 예제처럼 `int score`로 써도 충분합니다.

값 매개변수 자체에 붙은 `const`와도 연결해 봅시다. `const int threshold`라는 값 매개변수를 쓰면 함수 안에서 매개변수 복사본을 수정하지 못합니다. 호출자의 정수와 연결되는 것은 아닙니다. 반면 `const std::vector<int>& scores`의 `const`는 참조를 통해 접근하는 목록의 수정을 제한합니다. 두 선언은 보호하는 대상과 전달 방식이 다릅니다.

## 10 실패하는 예제로 경계 이해하기

### 의도된 컴파일 실패 1 읽기 전용 목록 수정

파일: `examples/fail_01_modify_const.cpp`

```cpp
#include <vector>

void replaceFirst(const std::vector<int>& scores)
{
    scores[0] = 100; // Intentional compile error: cannot modify through const reference.
}

int main()
{
    std::vector<int> scores{50};

    replaceFirst(scores);
}
```

오류의 핵심은 `scores[0] = 100;`입니다. 인덱스 0이 존재하는지를 알아보기 전에, `const` 참조를 통한 원소 수정 자체가 허용되지 않습니다. 컴파일러별 오류 문구는 다를 수 있습니다.

이 문제를 해결한다고 무조건 `const`를 지우지 마세요. 함수가 점수를 바꾸어야 하는 함수인지 먼저 확인해야 합니다. 합계처럼 읽는 함수였다면 잘못된 대입을 제거하는 것이 맞습니다. 정말 원본을 바꾸는 별도 기능이라면 수정 가능한 참조가 필요할 수 있지만, 그것은 함수의 계약을 바꾸는 결정입니다.

### 의도된 컴파일 실패 2 대상 없는 참조

파일: `examples/fail_02_uninitialized_reference.cpp`

```cpp
int main()
{
    int& score; // Intentional compile error: a reference needs an initializer.

    score = 80;
}
```

`int& score;`에는 연결할 대상이 없습니다. 나중에 `score = 80;`이라고 쓴다고 초기화가 소급해서 이루어지지 않습니다. 참조가 아니라 정수 변수를 만들 목적이었다면 `int score = 80;`이 맞습니다. 기존 정수에 별명을 붙일 목적이었다면 기존 변수를 만든 뒤 `int& score = original;`처럼 선언해야 합니다.

두 실패 예제는 정상 실행 파일로 만들 수 없어야 하는 예제입니다. 반면 앞에서 본 지역 참조 반환은 경고를 내고 컴파일될 수도 있습니다. “컴파일 오류가 없으면 수명도 안전하다”는 결론을 내리면 안 됩니다.

### 오늘의 선택 기준

작은 설정값을 넘길 때는 값 매개변수를 자연스럽게 사용합니다. 기존 목록을 함수 실행 중 읽기만 할 때는 `const std::vector<int>&`를 사용합니다. 계산 결과인 정수, 실수, 문자열은 값으로 반환합니다. 빈 자료처럼 계산할 수 없는 경우는 함수의 사전 조건과 호출부의 분기로 명확히 다룹니다.

이 기준은 모든 C++ 함수에 대한 최종 규칙이 아닙니다. 하지만 지금 배운 문법으로 데이터를 처리하는 함수를 정확히 만드는 데 충분합니다. 더 복잡한 기술을 추가하기 전에 각 함수가 무엇을 읽고, 무엇을 바꾸고, 무엇을 돌려주는지 설명할 수 있어야 합니다.

## 연습문제

먼저 스스로 풀고 뒤의 해설을 확인하세요. 코드 작성 문제에도 최대 100개, 점수 0부터 100이라는 조건을 그대로 적용합니다.

### 문제 1 출력 추적

다음 코드의 출력 두 줄을 쓰고, `alias = second;`의 의미를 설명하세요.

```cpp
int first = 20;
int second = 30;
int& alias = first;
int copy = alias;

alias = second;
second = 90;

std::cout << first << " " << second << std::endl;
std::cout << alias << " " << copy << std::endl;
```

### 문제 2 매개변수 선택

다음 두 요구에 맞는 함수 선언을 작성하세요.

1. 정수 목록을 읽어서 합계를 반환하는 `sumScores`.
2. 정수 목록에서 기준 점수 이상인 개수를 반환하는 `countAtLeast`. 기준 점수도 인수로 받습니다.

목록과 기준값에 서로 다른 전달 방식을 선택한 이유를 한 문장씩 쓰세요.

### 문제 3 const의 범위

아래 세 줄 중 컴파일 오류가 나는 줄을 고르세요. 마지막 출력값도 쓰세요.

```cpp
std::vector<int> scores{50, 70};
const std::vector<int>& view = scores;

// A: view[0] = 60;
// B: scores[0] = 60;
// C: std::cout << view[0] << std::endl;
```

A, B, C는 선택지를 표시한 것입니다. 오류인 줄은 실행하지 않고, 나머지 줄만 순서대로 실행한다고 가정하세요. “원본이 const로 바뀌었기 때문”이라는 설명이 왜 맞지 않는지도 쓰세요.

### 문제 4 평균 오류 수정

다음 함수는 비어 있지 않은 검증된 목록을 받는다고 가정합니다. 점수 80, 81에 대해 80.5가 아니라 80을 반환하는 이유를 설명하고 수정하세요. 빈 목록일 때 이 함수를 호출하지 않는 `if` 문도 작성하세요.

```cpp
double averageScore(const std::vector<int>& scores)
{
    int total = sumScores(scores);

    return total / scores.size();
}
```

### 문제 5 수명과 반환 타입

다음 함수의 문제를 설명하고, 결과 문자열을 안전하게 반환하도록 수정하세요. “지역 변수를 반환하면 모두 위험하다”라는 설명도 함께 교정하세요.

```cpp
const std::string& makeLabel()
{
    std::string label = "Score summary";

    return label;
}
```

### 문제 6 범위 안의 점수 세기

`countInRange` 함수를 작성하세요. 목록, 최저 점수 `low`, 최고 점수 `high`를 받아 `low <= 점수 <= high`인 원소의 개수를 값으로 반환합니다. 목록은 변경하지 않아야 합니다. `0 <= low <= high <= 100`은 호출자가 지키는 사전 조건으로 둡니다.

다음 네 경우의 예상값도 쓰세요.

- `{0, 59, 60, 79, 80, 100}`, 범위 60부터 80
- 같은 목록, 범위 0부터 100
- 빈 목록, 범위 60부터 80
- `{80, 80}`, 범위 80부터 80

추가로 이 함수에서 개수를 담는 `int`가 충분한 이유를 설명하세요.

## 연습문제 상세 해설

### 해설 1

```text
30 90
30 20
```

`copy`는 `alias`가 가리키는 값 20으로 초기화한 별도 정수입니다. `alias = second;`는 `first`에 30을 대입합니다. 참조 대상을 `second`로 바꾸지 않습니다. 그러므로 그 뒤 `second`가 90이 되어도 `alias`와 `first`는 30입니다. `copy`는 처음 복사한 20으로 남습니다.

잘못 풀었다면 대입문을 실행할 때마다 `alias`라는 이름을 `first`로 바꾸어 읽어 보세요. 참조 선언을 이미 마친 뒤에는 어느 대상의 값을 바꾸는지 추적하기가 쉬워집니다.

### 해설 2

```cpp
int sumScores(const std::vector<int>& scores);
int countAtLeast(const std::vector<int>& scores, int threshold);
```

목록은 기존 자료를 읽을 뿐이므로 읽기 전용 참조로 받습니다. 따라서 이 매개변수를 위한 목록 전체 복사본을 만들지 않고, 이 경로를 통해 원본을 수정할 수도 없습니다. 기준값은 하나의 작은 정수 입력이므로 값으로 받습니다.

`int`를 반환하는 이유는 결과가 합계 또는 개수라는 값이기 때문입니다. 계산에 쓴 지역 변수의 참조를 돌려줄 필요가 없습니다. 반환 타입까지 `const int&`로 바꾸면 오히려 지역 변수의 수명 문제를 만들 수 있습니다.

### 해설 3

오류인 줄은 A입니다. B를 실행한 뒤 C의 출력은 60입니다. `view`는 원본의 값을 복사해 보관하지 않습니다. B가 원본을 수정하면 C도 변경된 원본을 읽습니다.

원래 선언은 `std::vector<int> scores`이므로 `scores` 자체는 수정 가능한 목록입니다. `const`는 `view`를 통한 수정만 제한합니다. 원본까지 `const std::vector<int> scores{50, 70};`로 선언했다면 B도 허용되지 않지만, 제시된 코드는 그렇지 않습니다.

### 해설 4

반환 타입은 함수 결과의 타입입니다. `total / scores.size()`가 먼저 정수 나눗셈으로 계산된 뒤 `double`로 변환되면 소수 부분은 이미 사라졌습니다. 이번 범위에서는 다음처럼 개수를 실수로 변환하면 됩니다.

```cpp
double averageScore(const std::vector<int>& scores)
{
    const int total = sumScores(scores);
    const double count = static_cast<double>(scores.size());

    return total / count;
}
```

호출부는 다음과 같습니다.

```cpp
if (scores.empty()) {
    std::cout << "Average: no data" << std::endl;
} else {
    std::cout << averageScore(scores) << std::endl;
}
```

빈 목록을 먼저 검사하므로 평균 함수에 잘못된 자료를 전달하지 않습니다. `averageScore`를 먼저 호출해 결과를 변수에 저장한 다음 `empty()`를 검사하는 순서라면 해결되지 않습니다. 문제는 출력할지 여부가 아니라 계산 자체가 가능한지 여부입니다.

### 해설 5

지역 문자열 `label`의 수명은 함수가 끝날 때 종료됩니다. 그런데 함수는 그 대상에 대한 참조를 반환합니다. 호출자가 이 참조를 통해 문자열을 사용하면 이미 수명이 끝난 대상에 접근하게 됩니다. `const`는 수명을 연장해 주는 보증이 아닙니다.

```cpp
std::string makeLabel()
{
    std::string label = "Score summary";

    return label;
}
```

이제 결과 문자열을 값으로 반환합니다. 다음처럼 호출하면 `label`이라는 지역 변수의 수명과 무관하게 결과 문자열을 사용할 수 있습니다.

```cpp
std::string result = makeLabel();

std::cout << result << std::endl;
```

위험한 것은 일반적인 자동 지역 변수의 **참조**를 반환하여 수명 이후에 사용하게 만드는 것입니다. 지역 변수의 **값**을 반환하는 것은 기본적인 올바른 패턴입니다. 또한 값 반환을 고쳤다고 “항상 문자열 전체를 한 번 복사한다”라고 단정하지 않습니다. 언어가 허용하는 복사 생략이나 이동이 있을 수 있습니다.

### 해설 6

```cpp
int countInRange(const std::vector<int>& scores, int low, int high)
{
    int count = 0;

    for (int score : scores) {
        if (low <= score && score <= high) {
            ++count;
        }
    }

    return count;
}
```

두 비교를 `&&`로 연결합니다. 수학에서 쓰는 `low <= score <= high`를 그대로 C++ 식으로 쓰면 의도한 두 비교가 되지 않습니다. 첫 비교 결과가 다시 다음 비교의 입력이 되기 때문입니다. 각각의 비교를 분리해서 작성하세요.

예상값은 차례대로 3, 6, 0, 2입니다. 첫 경우에는 60, 79, 80을 포함합니다. 넷째 경우에는 양 끝이 모두 포함되므로 80 두 개를 모두 셉니다. 빈 목록에서는 반복문을 한 번도 실행하지 않아서 0을 반환합니다.

목록은 최대 100개이므로 결과 개수는 0부터 100입니다. 이 범위는 `int`로 충분합니다. 합계를 세는 것이 아니라 조건에 맞는 원소마다 1씩 세므로 점수 자체의 크기를 누적하지 않습니다. 입력 조건을 없애거나 자료가 매우 커지는 다른 프로그램에 적용할 때는 같은 타입 선택을 그대로 보장할 수 없습니다.

## 마무리 확인

- `int copied = original;`과 `int& alias = original;`의 차이를 설명할 수 있나요?
- `const std::vector<int>&`의 `const`와 `&`를 각각 설명할 수 있나요?
- 원본 변경과 참조를 통한 변경을 구분할 수 있나요?
- 지역 변수의 값은 반환해도 되지만 지역 변수의 참조는 왜 위험한지 설명할 수 있나요?
- 빈 목록에서 평균 함수를 호출하지 않는 위치를 찾을 수 있나요?
- 100개 이하의 0부터 100 점수에서 합계 최대값을 계산할 수 있나요?

이제 기존 자료를 읽어 결과를 만드는 작은 함수를 작성할 수 있습니다. 다음 코드를 읽을 때도 함수 이름만 보지 말고 매개변수와 반환 타입을 함께 보세요. 그 한 줄에 자료를 복사하는지, 기존 대상을 읽는지, 결과를 값으로 돌려주는지가 드러납니다.

## 공식 근거와 확인 범위

본문 예제와 문제는 이 수업을 위해 새로 작성했습니다. 아래 자료는 언어 규칙 확인에 사용했으며 예제 코드를 가져온 출처가 아닙니다.

1. [C++20 작업 초안 N4861](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2020/n4861.pdf): `[dcl.init.ref]` 참조 초기화, `[stmt.return]` 결과 초기화와 지역 변수 파괴 순서, `[class.copy.elision]` 반환 시 복사·이동 생략. 최종 유료 ISO 표준 원문 대신 공개 작업 초안을 확인했습니다.
2. [Microsoft Learn — const](https://learn.microsoft.com/en-us/cpp/cpp/const-cpp?view=msvc-170): 읽기 전용 접근과 const 선언.
3. [Microsoft Learn — Reference-Type Function Returns](https://learn.microsoft.com/en-us/cpp/cpp/reference-type-function-returns?view=msvc-170): 지역 변수 참조 반환의 위험과 MSVC C4172 경고.
4. [Microsoft Learn — /std](https://learn.microsoft.com/en-us/cpp/build/reference/std-specify-language-standard-version?view=msvc-170): `/std:c++20` 옵션 및 Visual Studio 설정 경로.

확인일: 2026-10-21.
