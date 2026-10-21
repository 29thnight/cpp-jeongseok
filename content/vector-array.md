한 사람의 이름은 `std::string` 변수 하나에 저장할 수 있습니다. 그렇다면 신청자가 세 명일 때는 어떻게 할까요? `name1`, `name2`, `name3`을 각각 만들어도 되지만, 네 번째 신청자가 오면 선언문부터 고쳐야 합니다. 전체 이름을 출력하는 코드도 계속 길어집니다.

여러 값을 하나의 이름으로 묶고, 필요한 값을 골라 쓰거나 차례로 처리할 수 있다면 훨씬 편합니다. 이번 절에서는 그 일을 하는 표준 라이브러리 컨테이너인 `std::vector`와 `std::array`를 배웁니다. 컨테이너 안에 들어 있는 각각의 값을 **원소**라고 부릅니다.

## 이번 절의 목표

이 절을 마치면 다음 세 가지를 할 수 있습니다.

1. 원소 개수가 달라질 수 있는 상황과 개수가 고정된 상황을 구분하여 `std::vector` 또는 `std::array`를 선택합니다.
2. 원소의 개수와 인덱스를 구분하고, 빈 컨테이너와 잘못된 인덱스를 안전하게 처리합니다.
3. 범위 기반 `for`와 `auto`로 원소를 읽고, `int` 원소의 복사본을 바꿔도 원본은 그대로임을 설명합니다.

변수, 조건문, 반복문, 기본 함수, `std::string`을 알고 있다고 가정합니다. 포인터나 메모리 관리 지식은 필요하지 않습니다. `std::vector<bool>`은 별도 특성이 있으므로 이 절에서 다루지 않습니다.


## 예제 파일 내려받기

[전체 예제 ZIP](/cpp-jeongseok/assets/examples/02-3/02-3-container-examples.zip) · [실행 안내](/cpp-jeongseok/assets/examples/02-3/README.md)

- [01_vector_start.cpp](/cpp-jeongseok/assets/examples/02-3/01_vector_start.cpp)
- [02_vector_count_vs_list.cpp](/cpp-jeongseok/assets/examples/02-3/02_vector_count_vs_list.cpp)
- [03_array_fixed_size.cpp](/cpp-jeongseok/assets/examples/02-3/03_array_fixed_size.cpp)
- [04_checked_index.cpp](/cpp-jeongseok/assets/examples/02-3/04_checked_index.cpp)
- [05_range_for_and_auto.cpp](/cpp-jeongseok/assets/examples/02-3/05_range_for_and_auto.cpp)
- [06_size_not_capacity.cpp](/cpp-jeongseok/assets/examples/02-3/06_size_not_capacity.cpp)
- [07_score_summary_solution.cpp](/cpp-jeongseok/assets/examples/02-3/07_score_summary_solution.cpp)
- [08_auto_rules.cpp](/cpp-jeongseok/assets/examples/02-3/08_auto_rules.cpp)

## 실습 준비

Visual Studio의 C++ 콘솔 프로젝트에서 예제마다 소스 파일 하나를 실행합니다. 여러 예제의 `main`을 같은 프로젝트에 동시에 넣지 않습니다. 프로젝트 속성에서 C++ 언어 표준을 C++20, 예외 처리를 `/EHsc`, 경고 수준을 `/W4`로 설정합니다.

Developer Command Prompt에서는 다음처럼 빌드할 수 있습니다. 이 명령은 학습자용 실행 방법이며, 여기에서 MSVC로 실행했다는 뜻은 아닙니다.

```text
cl /std:c++20 /EHsc /W4 01_vector_start.cpp
```

본문의 ‘예상 출력’은 코드가 의도하는 결과입니다. 직접 실행하기 전에 결과를 먼저 적고 비교해 봅니다. 출력 문자열은 환경별 문자 인코딩 차이에 덜 영향을 받도록 영문으로 작성했습니다.

## 1. `std::vector`와 `std::array` 중 무엇을 선택할까요?

### 먼저 개수가 정해지는 시점을 묻습니다

행사 신청 명단은 신청을 받을 때마다 길어질 수 있습니다. 오늘 세 명이라는 사실만으로 앞으로도 세 명이라고 정할 수는 없습니다. 이런 목록에는 실행 중에 원소를 추가할 수 있는 `std::vector`가 잘 맞습니다.

반면 빨강, 초록, 파랑 세 성분을 각각 정수로 저장한다면 개수는 항상 세 개입니다. 프로그램을 만들 때 개수를 정할 수 있고 그 개수 자체가 자료의 의미라면 `std::array`를 고려합니다. 두 컨테이너 모두 같은 타입의 원소를 순서대로 다룹니다. 우선 성능을 추측하기보다 자료가 요구하는 개수를 살펴봅니다.

<figure class="concept-figure">
<a href="/cpp-jeongseok/assets/illustrations/02-3-array-vector.webp"><img src="/cpp-jeongseok/assets/illustrations/02-3-array-vector.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="위에는 네 칸짜리 파란 트레이에 원소를 상징하는 조각 네 개가 있고, 아래에는 청록색 카드 세 장과 추가할 수 있는 별도 카드 한 장이 있습니다. array는 개수가 고정되어도 값은 바꿀 수 있고 vector는 개수를 바꿀 수 있다는 개념적 비유이며, 실제 메모리 배치는 아닙니다."></a>
<figcaption>그림 1. AI 생성 개념 일러스트. 위의 고정된 네 칸은 <code>std::array</code>, 아래의 카드를 더할 수 있는 모음은 <code>std::vector</code>를 떠올리기 위한 개념적 비유입니다. <code>std::array</code>는 원소 개수가 고정되지만 각 원소의 값은 바꿀 수 있고, <code>std::vector</code>는 원소 개수를 바꿀 수 있습니다. 실제 메모리 배치를 나타낸 그림은 아닙니다.</figcaption>
</figure>

| 확인할 질문 | `std::vector` | `std::array` |
|---|---|---|
| 개수를 실행 중에 바꿔야 하나요? | 원소를 추가하거나 줄일 수 있습니다. | 정해진 개수를 유지합니다. |
| 개수를 타입에 적나요? | `std::vector<int>`처럼 원소 타입을 적습니다. | `std::array<int, 3>`처럼 타입과 개수를 적습니다. |
| 어떤 헤더가 필요한가요? | `<vector>` | `<array>` |
| 이 절의 사용 사례는 무엇인가요? | 신청자 목록, 추가되는 점수 | 세 성분, 정해진 세 번의 측정값 |

“지금은 세 개”와 “항상 세 개”는 다릅니다. 지금 데이터가 세 개여도 나중에 추가해야 한다면 `std::vector`가 자연스럽습니다. 반대로 값을 수정할 수 있다는 이유만으로 `std::array`를 제외하지 않습니다. 고정되는 것은 원소의 **개수**입니다.

## 2. 이름 목록을 `std::vector`에 담아 봅니다

### 선언에서 무엇을 읽어야 할까요?

`std::vector<std::string> names{"Mina", "Jun", "Sol"};`은 문자열 세 개로 시작하는 목록을 만듭니다. `std::vector`는 컨테이너의 종류, 꺾쇠 안의 `std::string`은 원소 타입, `names`는 변수 이름입니다. 지금은 꺾쇠 안에 “무엇을 담는가”를 적는다고 이해하면 충분합니다.

### `auto`를 쓰기 전에 알아둘 기본 규칙

앞 수업에서는 문자열 검색 결과를 `auto`로 받았습니다. `auto`는 타입 자체가 아니라, 초기화 식을 바탕으로 컴파일러가 타입을 정하게 하는 표기입니다. 여기서는 함수 안의 일반 변수에 `auto`를 쓰는 규칙을 먼저 정리합니다.

1. 초기화 식이 필요합니다. `auto count = 3;`은 `int`, `auto ratio = 3.0;`은 `double`입니다. `auto count;`처럼 나중에 값을 넣겠다고 초기화를 생략하면 컴파일 오류입니다. 값이 실행 중 입력으로 정해지더라도 변수의 타입은 컴파일할 때 정해집니다.

2. 원하는 결과가 아니라 식의 타입을 따릅니다. `auto half = 5 / 2;`는 `int`이고 값은 2입니다. `auto half = 5.0 / 2;`는 `double`이고 값은 2.5입니다. `auto`가 정수 나눗셈을 실수 나눗셈으로 바꾸지는 않습니다. 원하는 타입이나 연산이 있다면 식 또는 선언에서 명확히 표현합니다.

3. 대입해도 타입은 바뀌지 않습니다. `auto count = 3;` 다음에 `count = 7;`을 쓰면 같은 `int` 변수의 값만 7로 바뀝니다. 다른 타입의 값을 대입할 때도 원래 타입으로의 변환 규칙을 따르며, 허용되지 않는 대입은 컴파일 오류입니다. 자동으로 모든 타입을 담는 변수가 아닙니다.

4. 이 수업의 값 변수에서는 원본과 복사본을 구분합니다. `const int limit = 3;`에서 `auto copy = limit;`을 만들면 copy는 별개의 `int`입니다. `copy = 4;`를 실행해도 limit는 3입니다. 원본 정수 변수의 `const`가 새 복사본까지 자동으로 붙지는 않습니다. 새 변수도 읽기 전용으로 만들려면 `const auto copy = limit;`을 씁니다. 이는 정수 값을 복사하는 예의 규칙이지, `auto`가 모든 위치의 `const`를 없앤다는 뜻은 아닙니다. 참조를 통한 접근은 02-4, 포인터와 대상의 `const`는 04-2에서 구분합니다.

5. 중괄호 표기를 섞지 않습니다. C++20에서 `auto one{1};`은 `int`지만, `auto one = {1};`은 `std::initializer_list<int>`라는 목록 타입입니다. 둘은 같은 선언이 아닙니다. `auto many{1, 2};`와 `auto mixed = {1, 2.0};`은 컴파일 오류입니다. 여기서는 목록 타입의 세부 기능을 확장하지 않고, 여러 값을 담으려면 `std::vector<int>`처럼 컨테이너 타입을 명시합니다.

6. 문자열처럼 보여도 타입은 다를 수 있습니다. `auto title = "Quiz";`는 `std::string`이 아닙니다. 이 절에서 문자열 객체를 원한다면 `auto title = std::string{"Quiz"};`처럼 적습니다. 큰따옴표만 보고 `std::string`이라고 판단하지 않습니다. 문자열 리터럴의 포인터 규칙은 04-2에서 다룹니다.

다음 예제의 `for (auto name : names)`는 각 문자열 원소로 name을 초기화하며, 이 경우 name은 원소를 복사한 `std::string`입니다. 범위 기반 `for`의 실행 흐름은 6절에서 다시 확인합니다. `auto&`와 `const auto&`는 참조를 배우는 02-4에서, 템플릿과 연결되는 타입 추론 원리는 09-1에서 이어갑니다. `auto&&`와 `decltype(auto)`는 지금 필요한 규칙에 포함하지 않습니다.

확인해 보기: `auto n = 5 / 2;`의 타입과 값, `const int source = 8;`에서 `auto copy = source;`로 만든 변수의 수정 가능 여부, `auto one{1};`과 `auto one = {1};`의 차이를 먼저 적어 봅니다. 해설: n은 `int`이며 2입니다. copy는 수정 가능한 별개의 `int`이고 source는 바뀌지 않습니다. 마지막 두 변수는 각각 `int`와 `std::initializer_list<int>`입니다. `08_auto_rules.cpp`에서 이 차이를 확인할 수 있습니다.

다음은 `01_vector_start.cpp`의 전체 코드입니다.

```cpp
#include <iostream>
#include <string>
#include <vector>

int main()
{
    std::vector<std::string> names{"Mina", "Jun", "Sol"};

    std::cout << "before: " << names.size() << '\n';
    std::cout << "first: " << names[0] << '\n';

    names[1] = "Jin";
    names.push_back("Ara");

    std::cout << "after: " << names.size() << '\n';
    std::cout << "names:";
    for (auto name : names)
    {
        std::cout << ' ' << name;
    }
    std::cout << '\n';
}
```

예상 출력:

```text
before: 3
first: Mina
after: 4
names: Mina Jin Sol Ara
```

처음에는 원소가 세 개이므로 `names.size()`는 `3`입니다. `names[0]`은 첫 번째 이름을 읽습니다. 대괄호 안의 번호를 **인덱스**라고 하며, 첫 번호는 `1`이 아니라 `0`입니다.

`names[1] = "Jin";`은 두 번째 원소의 값을 바꿉니다. 기존 원소를 바꿨으므로 개수는 그대로입니다. 이어서 `names.push_back("Ara");`가 맨 뒤에 새 원소를 하나 추가합니다. 이때 개수가 `4`가 됩니다. `[]`로 값을 바꾸는 일과 `push_back`으로 원소를 추가하는 일을 구별해 둡니다.

마지막 반복문은 각 이름을 차례로 출력합니다. `for (auto name : names)`의 자세한 뜻은 6절에서 확인합니다. 지금은 모든 원소를 처리할 때 숫자 인덱스를 직접 만들지 않아도 된다는 점을 눈여겨봅니다. 이 작은 예제의 `name`은 매번 문자열을 복사합니다. 복사가 언제나 비용 없이 이루어지는 것은 아니며, 큰 객체를 읽기만 할 때 복사를 피하는 `const` 참조는 다음 절에서 배웁니다.

직접 해 보기: 추가하는 이름을 바꾸고, 원소 하나를 더 추가합니다. 실행 전에 마지막 줄의 순서와 `after`에 나올 수를 예상합니다. 이름을 수정할 때와 추가할 때 개수가 각각 어떻게 변하는지도 말해 봅니다.

### `{3}`과 `(3)`은 같을까요?

정수 컨테이너를 만들 때는 괄호 모양을 특히 주의합니다. 다음 네 선언은 `02_vector_count_vs_list.cpp`의 핵심입니다.

```cpp
std::vector<int> one_value{3};
std::vector<int> three_zeros(3);
std::vector<int> two_values{3, 7};
std::vector<int> three_sevens(3, 7);
```

| 선언의 마지막 부분 | 실제 원소 | 원소 개수 |
|---|---|---|
| `one_value{3}` | `3` | `1` |
| `three_zeros(3)` | `0, 0, 0` | `3` |
| `two_values{3, 7}` | `3, 7` | `2` |
| `three_sevens(3, 7)` | `7, 7, 7` | `3` |

이 `std::vector<int>` 예제에서 중괄호는 나열한 값으로 시작합니다. 소괄호 하나의 정수는 만들 원소 개수이고, 두 정수는 개수와 채울 값입니다. 값 `3` 하나를 담으려는지, 원소 세 개를 만들려는지 먼저 말로 정한 뒤 코드를 적으면 실수를 줄일 수 있습니다. 이 구분을 모든 타입의 모든 초기화에 그대로 일반화하지는 않습니다.

`std::vector<int> scores{};`처럼 빈 중괄호를 쓰면 원소가 없는 목록으로 시작합니다. 빈 목록도 정상적인 상태입니다. 이후 `push_back`으로 필요한 값을 넣을 수 있습니다.

## 3. 개수가 정해진 값은 `std::array`로 표현합니다

### 고정된 개수라면 값도 못 바꾸나요?

세 번의 측정 결과를 담는다고 가정합니다. 결과를 다시 계산해 고칠 수는 있지만 측정 횟수는 세 번으로 정했습니다.

```cpp
#include <array>
#include <iostream>

int main()
{
    std::array<int, 3> scores{80, 90, 70};
    scores[1] = 95;

    std::cout << "size: " << scores.size() << '\n';
    std::cout << "second: " << scores[1] << '\n';
}
```

예상 출력은 `size: 3`, 다음 줄은 `second: 95`입니다. `std::array<int, 3>`의 `3`은 타입의 일부입니다. 원소 값이 바뀌어도 `size()`는 여전히 `3`입니다. `std::array`에는 `push_back`으로 네 번째 원소를 추가하는 기능이 없습니다. 01-1에서 배운 `const`로 값의 변경을 제한하는 일은 원소 개수 고정과 별개입니다.

`std::array<int, 3>`과 `std::array<int, 4>`는 서로 다른 타입입니다. 길이만 다른 같은 변수라고 생각해서 그대로 대입할 수 없습니다. 또한 실행 중에 입력받은 일반 변수로 이 개수를 정하지 않습니다. 개수가 입력에 달렸다면 앞에서 배운 `std::vector`를 먼저 떠올립니다.

### 빈 중괄호는 어떤 뜻일까요?

```cpp
std::array<int, 3> zeros{};
std::array<int, 3> partial{5};
std::array<int, 0> empty{};
```

`zeros`에는 `0` 세 개가 있습니다. `partial`에는 `5, 0, 0`이 있습니다. `int` 원소를 중괄호로 초기화하면서 적지 않은 나머지 원소는 `0`으로 초기화됩니다. 따라서 `partial.size()`도 `3`이지 `1`이 아닙니다. 선언에 적힌 개수와 초기값의 수를 따로 읽어야 합니다.

`empty`는 원소가 정말 없는 경우입니다. 타입의 개수가 `0`이므로 `empty.size()`는 `0`입니다. `zeros`처럼 값이 모두 `0`인 컨테이너와 원소 자체가 없는 컨테이너를 혼동하지 않습니다.

이 절에서는 초기값이 아직 없더라도 `{}`를 붙이는 습관을 사용합니다. 함수 안에서 `std::array<int, 3> values;`처럼 초기화를 생략하고 곧바로 원소를 읽는 코드는 작성하지 않습니다. `int` 값이 저절로 `0`이 된다고 가정할 수 없기 때문입니다. `03_array_fixed_size.cpp`에서 초기값과 빈 컨테이너의 반복 횟수를 함께 확인할 수 있습니다.

## 4. 개수와 마지막 인덱스를 구분합니다

### 원소가 세 개면 `scores[3]`도 있을까요?

다음 표는 `std::vector<int> scores{80, 90, 70};`의 정확한 원소 관계입니다. 그림의 인상 대신 이 표로 접근 가능한 위치를 확인합니다. 같은 세 값을 담은 `std::array<int, 3>`에도 인덱스 규칙은 같습니다.

| 인덱스 | 사람에게 말하는 순서 | 코드 | 값 |
|---|---|---|---|
| `0` | 첫 번째 | `scores[0]` | `80` |
| `1` | 두 번째 | `scores[1]` | `90` |
| `2` | 세 번째 | `scores[2]` | `70` |
| `3` | 원소 뒤의 위치 | 접근하면 안 됨 | 원소 없음 |

원소가 `n`개이고 `n`이 `0`보다 크면 유효한 인덱스는 `0, 1, ..., n - 1`입니다. 즉 인덱스는 `0` 이상이며 `size()`보다 **작아야** 합니다. `size()`는 개수이지 마지막 인덱스가 아닙니다. 원소가 `0`개이면 유효한 인덱스도 하나도 없습니다.

C++20에서 `[]`를 사용한 범위 밖 접근은 실행 결과가 보장되지 않는 **정의되지 않은 동작**입니다. 값이 우연히 출력되거나 디버그 환경에서 오류가 보이더라도 그 결과를 믿으면 안 됩니다. 오류를 경험해 보겠다고 실제로 접근하지 않고, 접근 전에 범위를 검사합니다.

### 비어 있을 때는 먼저 분기합니다

첫 원소를 출력하려면 그 원소가 존재하는지부터 확인합니다. 다음은 `main` 안에 넣을 수 있는 부분 코드입니다.

```cpp
std::vector<int> scores{};

if (scores.empty())
{
    std::cout << "no scores\n";
}
else
{
    std::cout << "first: " << scores[0] << '\n';
}
```

`empty()`는 원소가 없으면 `true`, 있으면 `false`입니다. “원소의 값이 전부 `0`인가?”를 검사하지 않습니다. `std::array<int, 3> zeros{};`에 대해 `zeros.empty()`는 `false`입니다.

마지막 원소를 읽으려고 곧바로 `scores[scores.size() - 1]`을 적는 것도 피합니다. 비어 있을 때에는 마지막 원소가 없고, `size()`가 반환하는 부호 없는 정수에서 `0 - 1`을 계산하는 문제까지 생깁니다. 이 절에서는 먼저 `empty()`로 분기하는 습관에 집중합니다.

### `at()`을 쓰면 모든 문제가 해결될까요?

`scores.at(1)`도 두 번째 원소에 접근합니다. 다만 `at()`은 범위를 검사하며 전달된 위치가 `size()` 이상이면 `std::out_of_range` 예외를 던집니다. `[]`와 같은 방식으로 잘못된 접근을 그냥 진행하지는 않습니다.

그러나 예외가 발생했다고 프로그램이 자동으로 친절한 안내를 하고 계속 실행되는 것은 아닙니다. 적절히 처리하지 않은 예외는 프로그램 종료로 이어질 수 있습니다. 예외 처리는 별도로 배우므로, 여기서는 `at()`만 붙이면 안전한 입력 처리가 완성된다고 생각하지 않습니다. 입력을 검사한 다음 유효한 위치에 접근하는 방법부터 익힙니다.

## 5. 입력받은 인덱스를 안전하게 사용합니다

### 음수도 들어올 수 있다면 무엇을 검사할까요?

사용자는 첫 원소를 고르려고 `0`을 입력할 수도 있고, 실수로 `-1`이나 `3`을 입력할 수도 있습니다. 점수가 세 개일 때 올바른 값은 `0`, `1`, `2`뿐입니다. 검사에는 왼쪽 경계와 오른쪽 경계가 모두 필요합니다.

`size()`는 부호 없는 개수를 반환합니다. 이를 음수가 가능한 `int`와 무심코 비교하면 정수 타입 변환 때문에 판단을 잘못 이해하기 쉽고 컴파일러 경고도 발생할 수 있습니다. C++20의 `std::ssize`는 부호 있는 정수 타입으로 개수를 얻는 데 사용할 수 있습니다. 이 예제에서는 `<iterator>`를 직접 포함하여 사용합니다.

다음은 `04_checked_index.cpp`의 전체 코드입니다.

```cpp
#include <cstddef>
#include <iostream>
#include <iterator>
#include <vector>

int main()
{
    std::vector<int> scores{80, 90, 70};
    int index = 0;

    if (!(std::cin >> index))
    {
        std::cout << "invalid input\n";
        return 0;
    }

    if (index < 0 || index >= std::ssize(scores))
    {
        std::cout << "out of range\n";
        return 0;
    }

    auto position = static_cast<std::size_t>(index);
    std::cout << "score: " << scores[position] << '\n';
}
```

읽는 순서도 실행 순서와 같습니다.

1. `std::cin >> index`가 정수를 읽지 못하면 접근하지 않고 끝냅니다.
2. `index < 0`으로 음수를, `index >= std::ssize(scores)`로 끝 경계 이상을 걸러냅니다. `||`는 둘 중 하나만 참이어도 잘못된 입력이라는 뜻입니다.
3. 두 검사를 통과한 뒤에만 `static_cast<std::size_t>(index)`로 접근에 사용할 부호 없는 위치를 만듭니다.
4. 확인된 위치의 원소를 읽습니다.

`static_cast`는 여기서 값을 지정한 타입으로 명시적으로 변환하는 문법입니다. 유효성을 검사해 주는 기능은 아닙니다. 음수를 먼저 변환하고 나중에 검사하거나 경고를 없애려고 무조건 변환하는 순서로 바꾸지 않습니다. `std::size_t`를 직접 쓰므로 `<cstddef>`도 포함했습니다.

| 입력 사례 | 예상 출력 | 원소 접근 여부 |
|---|---|---|
| `0` | `score: 80` | 첫 원소를 읽습니다. |
| `2` | `score: 70` | 마지막 원소를 읽습니다. |
| `-1` | `out of range` | 읽지 않습니다. |
| `3` | `out of range` | 읽지 않습니다. |
| `abc` | `invalid input` | 읽지 않습니다. |

이 예제의 입력 규칙은 정수 하나를 읽는 것입니다. `1abc`처럼 숫자 뒤에 문자가 이어지면 정수 `1`을 읽는 데 성공할 수 있습니다. 입력 줄 전체에 여분의 문자가 없는지까지 검사하는 프로그램은 아닙니다. 입력 형식 검증을 확장하는 일과 컨테이너의 범위를 검사하는 일을 구분합니다.

직접 해 보기: 초기화 목록을 비워 `scores{}`로 바꿉니다. 이제 `0`도 거절되어야 합니다. 빈 목록을 특별히 인덱스 `0`까지 허용하는 예외로 만들지 않았는지 확인합니다.

## 6. 모든 원소를 읽을 때는 범위 기반 `for`를 씁니다

### 합계에 필요한 것은 위치일까요, 값일까요?

전체 점수의 합계를 구할 때는 “두 번째 위치”보다 “각 점수의 값”이 필요합니다. 이런 경우 범위 기반 `for`가 의도를 간단하게 보여 줍니다.

```cpp
std::vector<int> scores{80, 90, 70};
int total = 0;

for (int score : scores)
{
    total += score;
}

std::cout << total << '\n';
```

콜론 오른쪽의 `scores`는 순회할 컨테이너입니다. 왼쪽의 `score`는 매 반복에서 사용할 변수입니다. 이 예제에서는 `80`, `90`, `70`이 차례로 `score`에 복사되어 합계 `240`을 만듭니다. `score` 자체가 인덱스인 것은 아닙니다.

범위 기반 `for`는 원소가 없으면 본문을 한 번도 실행하지 않습니다. 따라서 비어 있는 `std::vector<int>`나 `std::array<int, 0>`을 그대로 순회해도 됩니다. 위 합계 코드에서 목록이 비었다면 `total`은 처음의 `0`을 유지합니다.

### `auto`는 타입을 없애는 문법인가요?

`auto`를 쓰면 컴파일러가 초기화하는 값을 보고 변수의 타입을 결정합니다. 실행 중에 아무 타입으로나 바뀌는 변수를 만드는 문법은 아닙니다.

```cpp
auto total = 0;
auto title = std::string{"Quiz"};
auto count = scores.size();
```

`total`은 정수 리터럴 `0`으로 초기화되므로 `int`입니다. `title`은 명시적으로 만든 `std::string`으로 초기화되어 `std::string`입니다. `count`는 `scores.size()`의 반환 타입을 따릅니다. 타입이 헷갈리면 초기화 식을 되짚습니다. 단순히 `auto`라는 단어만 보고 값을 예상하지 않습니다.

범위 기반 `for`도 `for (auto score : scores)`로 적을 수 있습니다. 이 절의 `std::vector<int>`에서 `score`는 각 원소에서 복사한 별도의 `int` 변수입니다. `std::array<int, 3>`에서도 같은 방식으로 읽을 수 있습니다.

### 복사본을 바꾸면 원본도 바뀔까요?

다음 부분 코드를 실행하기 전에 두 줄의 차이를 예상합니다.

```cpp
std::vector<int> scores{80, 90, 70};

std::cout << "copies:";
for (auto score : scores)
{
    score += 10;
    std::cout << ' ' << score;
}

std::cout << "\noriginal:";
for (auto score : scores)
{
    std::cout << ' ' << score;
}
std::cout << '\n';
```

예상 출력:

```text
copies: 90 100 80
original: 80 90 70
```

첫 반복에서 `scores[0]`의 값 `80`을 복사한 `score`가 만들어집니다. `score += 10`은 그 복사본을 `90`으로 바꿉니다. 원소 `scores[0]`에 대입한 적은 없으므로 원본은 `80`입니다. 다음 원소들도 같은 과정을 거칩니다.

“반복문 안에서 값을 바꿨다”보다 **어느 변수에 대입했는가**를 확인해야 합니다. `scores[1] = 95;`는 컨테이너의 원소를 대상으로 합니다. `score = 95;`는 이 반복문의 복사본을 대상으로 합니다. `05_range_for_and_auto.cpp`에서 합계, 개수, 복사본과 원본의 출력을 한 번에 비교할 수 있습니다.

이번 절에서는 값 복사로 읽는 경우를 확실하게 익힙니다. 원본과 연결되는 참조, 그리고 이미 배운 `const`를 참조와 함께 사용하여 수정하지 않는 접근을 표현하는 방법은 다음 절에서 다룹니다. 여기서 본 규칙을 특수한 `std::vector<bool>`까지 확대하지 않습니다.

### 순회 중에 원소를 더해도 될까요?

이 절의 범위 기반 `for` 안에서는 순회 중인 컨테이너에 `push_back`을 하거나 `resize` 등으로 개수를 바꾸지 않습니다. 반복이 사용하는 위치 정보가 더 이상 유효하지 않게 될 수 있기 때문입니다. 추가할 값이 정해졌다면 먼저 추가하고, 그 뒤에 순회합니다. 순회 도중 모인 새 값은 순회가 끝난 뒤 별도로 반영하는 설계를 생각할 수 있습니다.

짧은 주의: `reserve(8)`은 원소 여덟 개를 만드는 명령이 아닙니다. 빈 `std::vector<int>`에 호출해도 `size()`는 `0`입니다. 따라서 곧바로 `[0]`에 접근하면 안 됩니다. 원소를 추가하는 `push_back`과 저장 공간을 준비하는 `reserve`를 혼동하지 않습니다. 지금은 `capacity()`의 수치나 성능 조정보다 실제 원소 수인 `size()`를 기준으로 접근하면 충분합니다.

## 7. 연습 문제

정답을 보기 전에 선택 이유나 예상 출력을 먼저 적습니다. 오류가 있는 코드는 실행하지 말고, 조건을 고친 뒤 실행합니다.

### 문제 1. 컨테이너 선택하기

다음 자료에 `std::vector`와 `std::array` 중 무엇이 더 자연스러운지 고르고 선언문도 적습니다.

- 신청을 받을 때마다 이름이 추가되는 명단
- 정수 세 개로 표현하는 빨강, 초록, 파랑 값 `255, 128, 0`
- 프로그램을 실행한 뒤 전달받은 점수 개수만큼 저장할 목록

판단 근거에 “현재 개수”가 아니라 “언제 개수를 알며, 바뀌는가”를 포함합니다.

### 문제 2. 초기화 결과 예상하기

각 변수의 원소 개수와 모든 원소 값을 적습니다.

```cpp
std::vector<int> a{4};
std::vector<int> b(4);
std::vector<int> c(2, 9);
std::array<int, 4> d{9};
```

또한 `d`가 비어 있는지 설명합니다.

### 문제 3. 경계와 빈 상태 구별하기

`std::vector<int> values{10, 20, 30, 40};`의 `size()`와 마지막 유효 인덱스를 적습니다. 인덱스 `-1`, `0`, `3`, `4` 중 허용되는 것도 고릅니다.

이어서 `std::vector<int> none{};`과 `std::array<int, 3> zeros{};` 각각의 `size()`와 `empty()` 결과를 적습니다. 두 컨테이너를 범위 기반 `for`로 순회하면 본문은 몇 번 실행될까요?

### 문제 4. 잘못된 검사 고치기

아래는 정수 입력에 성공한 뒤 사용하는 잘못된 검사입니다. `scores`의 원소는 세 개입니다. `-1`과 `3`도 거절하도록 조건을 고치고, 검사 이후에만 원소를 읽는 코드까지 완성합니다. 검사 전에 타입을 변환하지 않습니다.

```cpp
if (index > std::ssize(scores))
{
    std::cout << "out of range\n";
    return 0;
}
```

### 문제 5. 무엇이 바뀌었는지 설명하기

다음 부분 코드의 출력 두 줄을 적습니다. 첫 반복문이 원본을 바꾸지 않는 이유도 한 문장으로 설명합니다.

```cpp
std::array<int, 3> values{2, 4, 6};
std::cout << "copies:";
for (auto value : values)
{
    value = 0;
    std::cout << ' ' << value;
}
std::cout << "\noriginal:";
for (auto value : values)
{
    std::cout << ' ' << value;
}
std::cout << '\n';
```

### 문제 6. 점수 요약 프로그램 만들기

`55, 80, 60, 95`로 시작하는 `std::vector<int>`를 만듭니다. 점수 `40`을 하나 추가한 다음 전체 개수, 합계, 통과 인원을 출력합니다. `60`점 이상이면 통과이며, 이미 배운 일반 함수 `bool is_passing(int score)`로 통과 여부를 판단합니다.

조건은 다음과 같습니다.

- 추가는 반복문 전에 합니다.
- 범위 기반 `for`와 `auto`를 사용합니다.
- 원본 점수는 수정하지 않습니다.
- 초기화 목록이 비었고 추가도 하지 않은 경우에는 개수, 합계, 통과 인원이 모두 `0`이어야 합니다.

## 8. 정답과 해설

### 문제 1 해설

명단은 개수가 늘어나므로 `std::vector<std::string> names{};`가 자연스럽습니다. 빨강, 초록, 파랑 값은 항상 세 성분이므로 `std::array<int, 3> rgb{255, 128, 0};`가 의미를 잘 드러냅니다. 실행 후에 개수를 전달받는 점수 목록은 `std::vector<int> scores{};`로 시작할 수 있습니다.

세 번째 상황에서 개수가 검증되어 있다면 그 개수로 `std::vector<int>`를 만들 수도 있습니다. 여기서는 입력받은 개수 자체의 검증을 아직 작성하지 않았으므로, 음수를 곧바로 생성자의 개수에 넘기는 코드는 사용하지 않습니다. 핵심은 실행 중의 일반 입력값을 `std::array` 타입의 고정 개수로 삼지 않는 것입니다.

필요한 헤더는 명단에 `<vector>`와 `<string>`, 색상에 `<array>`입니다. 같은 프로그램에서 모두 사용한다면 세 헤더를 포함합니다.

### 문제 2 해설

| 변수 | 원소 개수 | 원소 값 |
|---|---|---|
| `a` | `1` | `4` |
| `b` | `4` | `0, 0, 0, 0` |
| `c` | `2` | `9, 9` |
| `d` | `4` | `9, 0, 0, 0` |

`a`의 중괄호는 값 `4` 하나를 나열합니다. `b`의 소괄호는 정수 원소 네 개를 만들며, 이 `int` 원소들은 `0`으로 시작합니다. `c`는 `9`를 두 개 만듭니다. `d`의 개수는 타입에 적힌 `4`이고, 중괄호에 적지 않은 나머지 `int` 원소는 `0`입니다. `d.empty()`는 `false`입니다.

### 문제 3 해설

`values.size()`는 `4`, 마지막 유효 인덱스는 `3`입니다. 제시한 인덱스 중 `0`과 `3`만 허용됩니다. `-1`은 시작보다 작고 `4`는 개수와 같아 범위를 벗어납니다.

`none.size()`는 `0`, `none.empty()`는 `true`이며 반복 횟수는 `0`입니다. `zeros.size()`는 `3`, `zeros.empty()`는 `false`이며 반복 횟수는 `3`입니다. `zeros` 안의 값이 모두 `0`이라는 사실은 원소 개수와 무관합니다.

### 문제 4 해설

수정할 부분 코드는 다음과 같습니다. 전체 프로그램의 입력 실패 처리는 5절과 같이 먼저 수행합니다. 필요한 헤더는 `<cstddef>`, `<iostream>`, `<iterator>`, `<vector>`입니다.

```cpp
if (index < 0 || index >= std::ssize(scores))
{
    std::cout << "out of range\n";
    return 0;
}

auto position = static_cast<std::size_t>(index);
std::cout << "score: " << scores[position] << '\n';
```

원래 조건은 음수를 전혀 검사하지 않았고, `>`만 사용하여 개수와 같은 `3`도 통과시켰습니다. `>=`와 음수 검사를 함께 사용해야 합니다. 타입 변환은 두 경계를 통과한 뒤에 있습니다. `scores`가 비어 있으면 `0`도 거절하므로 같은 조건을 그대로 사용할 수 있습니다.

### 문제 5 해설

첫 줄은 `copies: 0 0 0`, 둘째 줄은 `original: 2 4 6`입니다. 첫 반복문의 `value`는 각 `int` 원소의 복사본이므로 `value = 0;`은 원본 원소에 대입하지 않습니다. `std::array`라서 원본이 유지되는 것이 아니라, 이 반복문에서 복사본을 수정했기 때문입니다.

원본의 첫 원소 하나를 바꾸려면, 여기서는 유효한 인덱스임을 아는 `values[0] = 0;`처럼 대상을 명확히 적을 수 있습니다. 모든 원소를 참조로 순회하며 바꾸는 방법은 다음 학습 내용과 연결됩니다.

### 문제 6 해설

다음은 `07_score_summary_solution.cpp`의 전체 코드입니다.

```cpp
#include <iostream>
#include <vector>

bool is_passing(int score)
{
    return score >= 60;
}

int main()
{
    std::vector<int> scores{55, 80, 60, 95};
    scores.push_back(40);

    int total = 0;
    int passing = 0;
    for (auto score : scores)
    {
        total += score;
        if (is_passing(score))
        {
            ++passing;
        }
    }

    std::cout << "count: " << scores.size() << '\n';
    std::cout << "total: " << total << '\n';
    std::cout << "passing: " << passing << '\n';
}
```

예상 출력:

```text
count: 5
total: 330
passing: 3
```

합계는 `55 + 80 + 60 + 95 + 40`입니다. `80`, `60`, `95`가 통과하므로 통과 인원은 세 명입니다. `is_passing`은 점수 하나를 판단하고, 반복문은 모든 점수를 모아 요약합니다. 함수가 맡은 일과 반복문이 맡은 일을 나누어 읽을 수 있습니다.

빈 경우도 확인합니다. 선언을 `std::vector<int> scores{};`로 바꾸고 `push_back` 줄을 제거하면 반복문은 실행되지 않습니다. `total`과 `passing`을 미리 `0`으로 초기화했으므로 출력은 각각 `count: 0`, `total: 0`, `passing: 0`입니다. 빈 컨테이너의 첫 원소를 읽지 않아도 요약을 만들 수 있습니다.

## 마무리: 세 문장으로 점검합니다

- 개수가 달라질 수 있으면 `std::vector`, 프로그램을 만들 때 정해지는 고정 개수를 표현하려면 `std::array`를 고려합니다.
- 원소의 개수는 `size()`이고, 유효한 인덱스는 `0` 이상이며 그 개수보다 작습니다. 비어 있으면 접근 가능한 원소가 없습니다.
- 이 절의 `int` 원소에서 `for (auto value : values)`의 `value`는 복사본입니다. 복사본 수정은 원본 원소 수정이 아닙니다.

다음 절에서는 여러 값을 함수에 전달할 때 복사가 언제 생기는지, `const`와 참조로 “읽기만 한다”는 의도를 어떻게 표현하는지 이어서 살펴봅니다. 그 전에 원본과 복사본을 구별하는 마지막 실습을 자신의 말로 설명해 봅니다.

## 참고 자료

예제와 설명은 이 절을 위해 새로 구성했습니다. 문법과 라이브러리 계약을 확인하는 자료는 다음과 같습니다. 문서의 고급 예제까지 지금 모두 익힐 필요는 없습니다.

1. [Microsoft Learn: `vector` 클래스](https://learn.microsoft.com/en-us/cpp/standard-library/vector-class?view=msvc-170) — 선언, 생성, `push_back`, `size`, `empty`.
2. [Microsoft Learn: `array` 클래스](https://learn.microsoft.com/en-us/cpp/standard-library/array-class-stl?view=msvc-170) — 고정 개수, 초기화, 원소 접근.
3. [Microsoft Learn: 범위 기반 `for`](https://learn.microsoft.com/en-us/cpp/cpp/range-based-for-statement-cpp?view=msvc-170) — 순회 구문과 값으로 받는 반복 변수.
4. [Microsoft Learn: `auto`](https://learn.microsoft.com/en-us/cpp/cpp/auto-cpp?view=msvc-170) — 초기화 식에 따른 타입 추론.
5. [C++20 작업 초안 N4861](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2020/n4861.pdf) — `[sequence.reqmts]`의 `at()` 경계, `[iterator.range]`의 `std::ssize`, `[vector.capacity]`의 `reserve`, `[array]`의 고정 개수 규칙.
