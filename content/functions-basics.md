매개변수, 반환값, 지역 변수, 선언과 정의의 첫 소개

지금까지는 변수를 만들고, 조건에 따라 다른 일을 하고, 반복하면서 입력을 검사했습니다. 작은 주문 계산기도 완성했습니다. 이제 프로그램에 들어가는 일이 조금씩 늘어납니다. 모든 코드를 `main` 안에 계속 쓰면 실행 순서는 보이지만, 어느 부분이 어떤 일을 맡았는지는 알아보기 어려워집니다.

이번에는 **하나의 일을 이름 붙여 묶고, 필요한 값을 건네고, 결과를 돌려받는 방법**을 배웁니다. 목표는 무조건 함수를 많이 만드는 것이 아닙니다. 함수를 읽는 사람이 “무엇을 받아서 무엇을 해 주는가?”에 답할 수 있도록 만드는 것입니다.

이 글을 마치면 다음을 직접 설명하고 작성할 수 있어야 합니다.

- 매개변수와 인수를 구별하고, 정수 값을 함수에 전달하기
- `return`으로 돌려준 값과 `std::cout`으로 표시한 내용을 구별하기
- `void` 함수와 값을 반환하는 함수를 목적에 맞게 선택하기
- 지역 변수와 값 매개변수의 범위를 이해하기
- 선언과 정의를 구별하고, 호출 전에 필요한 정보를 배치하기
- 입력 검사, 계산, 출력의 책임을 나누어 작은 프로그램 완성하기

실습 환경은 **Visual Studio의 MSVC와 C++20**입니다. 기존 콘솔 프로젝트의 속성에서 `C/C++ → 언어 → C++ 언어 표준`을 `ISO C++20 표준(/std:c++20)`으로 설정합니다. 각 예제는 별도 프로젝트로 실행하거나 프로젝트에 이번에 실행할 `.cpp` 하나만 포함합니다. 여러 예제의 `main`을 한 프로젝트에 함께 넣지 않습니다. 면적과 개수는 이 글에서 정한 작은 정수 범위를 사용합니다.

## 1. 줄 수보다 맡은 일을 먼저 봅니다

교실 안내판에 정사각형 카드를 붙이려고 합니다. 한 변이 6인 카드 네 장과 한 변이 8인 카드 세 장이 차지하는 면적을 각각 알아야 합니다. 카드끼리는 겹치지 않고, 간격과 여백은 면적에 포함하지 않습니다. 길이 단위가 센티미터라면 계산 결과의 단위는 제곱센티미터입니다.

두 묶음은 숫자만 다르고 계산 규칙은 같습니다. 한 변의 길이를 제곱한 뒤 카드 개수를 곱합니다. 이 규칙을 두 곳에 직접 쓰면, 나중에 계산 과정을 바꿀 때 두 곳을 모두 찾아야 합니다. 이름을 붙인 함수로 한 번 작성하면 필요한 곳에서 서로 다른 값을 넣어 사용할 수 있습니다.

중요한 것은 세 줄을 두 줄로 줄이는 효과가 아닙니다. **카드 면적을 구하는 규칙을 어디에서 확인하고 바꾸면 되는지 분명해지는 효과**입니다. 호출하는 쪽은 계산의 세부 순서 대신 함수 이름을 보고 목적을 읽을 수 있습니다.

## 2. 함수는 입력을 받아 일을 하고 결과를 건넵니다

카드 면적 계산을 세 부분으로 나누어 봅시다.

- 입력: 카드 한 변의 길이와 카드 개수
- 처리: 한 장의 면적을 구하고 개수를 곱하기
- 결과: 카드 전체가 차지하는 면적

여기에서 입력은 반드시 키보드 입력을 뜻하지 않습니다. **함수를 호출한 코드가 건네는 값**도 함수의 입력입니다. 결과 역시 반드시 화면에 표시되는 글자를 뜻하지 않습니다. **호출한 코드가 이어서 사용할 수 있는 값**이 될 수 있습니다.

함수 바깥에서는 무엇을 넣어야 하는지, 어떤 결과를 받을 수 있는지 알아야 합니다. 함수 안에서는 그 약속에 맞게 계산합니다. 이 경계가 분명하면 계산을 사용하는 쪽과 계산을 구현하는 쪽을 나누어 생각할 수 있습니다.

<figure class="concept-figure">
<a href="/cpp-jeongseok/assets/illustrations/02-1-function-workbench.webp"><img src="/cpp-jeongseok/assets/illustrations/02-1-function-workbench.webp" width="1200" height="800" loading="lazy" decoding="async" alt="교실 안내판 왼쪽에 작은 파란 정사각형 카드 네 장, 오른쪽에 더 큰 청록색 카드 세 장이 겹치지 않게 붙어 있습니다."></a>
<div class="figure-example"><strong>정사각형 카드의 전체 면적</strong><ul><li>calculateCardArea(6, 4)</li><li>한 장: 6 × 6 = 36 / 네 장: 36 × 4 = 144</li><li>calculateCardArea(8, 3)은 192를 반환합니다. 두 결과의 합은 336이며 반환 자체가 화면 출력은 아닙니다.</li></ul></div>
<figcaption>그림 1. AI 생성 개념 일러스트입니다. 한 변이 6인 카드 네 장과 한 변이 8인 카드 세 장에 같은 면적 계산 규칙을 적용하는 예시입니다. 정확한 길이와 면적은 아래 계산표에서 확인합니다.</figcaption>
</figure>

모든 함수가 입력과 반환값을 모두 갖는 것은 아닙니다. 이번에는 먼저 정수 두 개를 받아 정수 하나를 돌려주는 함수로 시작하고, 뒤에서 값을 돌려주지 않는 출력 함수도 만납니다.

## 3. 처음 만드는 계산 함수

다음은 그대로 실행할 수 있는 완성 프로그램입니다. 파일 이름은 `01_card_area.cpp`입니다.

```cpp
#include <iostream>

int calculateCardArea(int sideLength, int cardCount)
{
    int oneCardArea = sideLength * sideLength;
    int totalArea = oneCardArea * cardCount;
    return totalArea;
}

int main()
{
    int smallCardArea = calculateCardArea(6, 4);
    int largeCardArea = calculateCardArea(8, 3);
    int combinedArea = smallCardArea + largeCardArea;

    std::cout << "Small cards: " << smallCardArea << '\n';
    std::cout << "Large cards: " << largeCardArea << '\n';
    std::cout << "Combined area: " << combinedArea << '\n';
}
```

예상 출력은 다음과 같습니다.

```text
Small cards: 144
Large cards: 192
Combined area: 336
```

처음 보는 부분을 함수의 첫 줄부터 읽어 봅시다.

```cpp
int calculateCardArea(int sideLength, int cardCount)
```

맨 앞의 `int`는 **반환형**입니다. 이 함수가 계산을 마치면 정수 값을 돌려준다는 뜻입니다. `calculateCardArea`는 함수 이름입니다. 괄호 안의 `int sideLength`와 `int cardCount`는 **매개변수**입니다. 함수가 전달받을 값의 자료형과, 함수 안에서 그 값을 부를 이름을 적습니다. 매개변수가 여러 개이면 쉼표로 구분합니다.

그 뒤의 중괄호 안이 **함수 본문**입니다. 앞에서 사용한 변수 선언과 계산식이 그대로 들어 있습니다. 마지막의 `return totalArea;`는 계산한 정수 값을 호출한 곳으로 돌려주면서 이번 함수 실행을 끝냅니다.

`main`에서 `calculateCardArea(6, 4)`라고 쓰면 함수를 **호출**합니다. 함수 이름만 적는 것과 다르게, 괄호와 전달할 값을 적어 실제로 일을 요청합니다. 이 호출은 정수 결과를 만들어 내므로 `smallCardArea`를 그 결과로 초기화할 수 있습니다.

첫 번째 호출의 흐름을 차례대로 따라가 보세요.

1. `main`이 `calculateCardArea(6, 4)`를 호출합니다.
2. 함수의 `sideLength`는 `6`, `cardCount`는 `4`로 시작합니다.
3. `oneCardArea`에 `36`을 저장합니다.
4. `totalArea`에 `144`를 저장합니다.
5. `return totalArea;`가 값 `144`를 돌려줍니다.
6. `main`의 `smallCardArea`가 `144`로 초기화되고 다음 문장으로 진행합니다.

두 번째 호출은 같은 함수 본문을 사용하지만 새로운 값 `8`과 `3`으로 계산합니다. 결과는 `192`입니다. 앞선 호출의 `totalArea`를 이어서 더하는 것이 아닙니다. 각 호출에서 필요한 지역 변수들이 만들어지고 해당 호출의 계산을 수행합니다.

함수를 파일 위에 작성했다고 해서 프로그램 시작 때 그 본문부터 실행되는 것은 아닙니다. 여기서는 `main`의 흐름을 따라가다가 호출을 만났을 때 해당 함수의 일을 수행합니다. **소스 파일에 적힌 위치와 실행 순서**를 구별해야 합니다.

## 4. 매개변수는 받는 자리, 인수는 건네는 값입니다

정의에 적은 `sideLength`와 `cardCount`는 매개변수입니다. 호출할 때 적은 `6`과 `4`는 **인수**입니다. 비슷한 말이지만 보는 위치가 다릅니다. 함수는 매개변수로 값을 받고, 호출하는 코드는 인수를 전달합니다.

인수에는 숫자만 적을 수 있는 것이 아닙니다. 이미 값을 가진 변수도 사용할 수 있습니다. 다음은 `main` 안에 들어갈 수 있는 코드 조각입니다.

```cpp
int side = 6;
int count = 4;
int area = calculateCardArea(side, count);
```

호출하는 쪽의 변수 이름이 함수의 매개변수 이름과 같을 필요는 없습니다. `side`가 가진 값은 첫 번째 매개변수 `sideLength`에, `count`가 가진 값은 두 번째 매개변수 `cardCount`에 전달됩니다. **이 예제에서 대응 관계를 정하는 것은 이름이 아니라 순서**입니다.

순서를 바꾸면 문제가 생길 수 있습니다. `calculateCardArea(4, 6)`도 정수 두 개를 전달하므로 문법에는 맞지만, 한 변이 4인 카드 여섯 장을 계산해서 `96`을 돌려줍니다. 우리가 원한 `144`와 다릅니다. 컴파일러는 두 정수의 현실적인 의미까지 대신 판단하지 않습니다.

함수의 첫 줄을 읽을 때 자료형만 보지 말고 매개변수 이름도 함께 보세요. 이름이 `a`, `b`이면 호출 순서의 의미를 기억해야 하지만, `sideLength`, `cardCount`이면 무엇이 먼저 오는지 더 쉽게 확인할 수 있습니다. 좋은 이름은 입력 순서 실수를 줄이는 작은 안내문입니다.

이 함수는 인수 두 개가 필요합니다. `calculateCardArea(6)`이나 `calculateCardArea(6, 4, 2)`는 올바른 호출이 아닙니다. 지금은 자료형 변환에 기대지 않고 `int` 매개변수에 `int` 값을 전달합니다.

## 5. `return`과 화면 출력은 별개의 일입니다

`return`은 호출한 코드에 값을 건넵니다. `std::cout`은 화면으로 연결된 표준 출력에 내용을 보냅니다. 결과를 사람이 볼 수 있게 만드는 일과, 다음 계산에서 사용할 값을 만드는 일은 구별해야 합니다.

첫 예제의 계산 함수 안에는 `std::cout`이 없습니다. 그래도 `144`와 `192`라는 결과를 돌려줍니다. `main`은 두 값을 더하고, 그 뒤에 필요한 내용을 출력합니다. 반환값이 있으므로 화면에 표시하지 않고 비교하거나 합산하는 일도 가능합니다.

반대로 함수가 `std::cout << totalArea;`만 수행한다고 해서 그 숫자가 호출한 코드의 변수에 자동으로 저장되지는 않습니다. 출력한 문자를 다음 계산에서 쓰기 위해 다시 읽어 오는 방식으로 만들 필요도 없습니다. 계산 결과가 필요하다면 적절한 반환형과 `return`으로 값을 전달합니다.

다음은 반환된 값을 버리는 호출입니다. 이미 정의한 계산 함수를 사용하는 코드 조각입니다.

```cpp
calculateCardArea(6, 4);
```

계산은 수행하지만, 호출한 쪽이 결과를 변수에 저장하거나 다른 식에 사용하지 않습니다. 이 함수는 출력도 하지 않으므로 눈에 보이는 결과가 없습니다. 함수가 호출되지 않은 것과는 다른 상황입니다.

`return`은 현재 실행 중인 함수를 끝낸다는 점도 중요합니다. 일반 계산 함수에서 `return`을 만나면 `main` 전체가 끝나는 것이 아니라 그 함수를 부른 곳으로 돌아갑니다. 반면 이 프로그램의 `main`에서 `return 1;`을 만나면 `main`을 끝내며 실패를 나타내는 종료 코드를 전달합니다.

정수를 반환하는 함수는 정상적으로 끝나는 모든 경로에서 정수 결과를 준비해야 합니다. 다음은 함수 정의만 보여 주는 코드 조각입니다.

```cpp
int atLeastOne(int count)
{
    if (count < 1)
    {
        return 1;
    }

    return count;
}
```

`count`가 `1`보다 작으면 첫 번째 `return`에서 끝납니다. 그렇지 않으면 마지막 `return`까지 갑니다. 두 문장이 연속해서 값을 돌려주는 것이 아니라, 실제로 선택된 경로에서 하나만 실행됩니다.

여기서 마지막 `return count;`를 빼면 일부 입력에서는 값을 반환하지 않은 채 본문 끝에 도달합니다. 이런 함수는 올바르지 않으며, 경고가 있더라도 실행해 결과를 믿으면 안 됩니다. `main`의 끝에 도달하면 `0`을 반환한 것으로 처리되는 특별한 규칙을 일반 `int` 함수에 적용하지 마세요.

## 6. 값을 돌려주지 않는 함수에는 `void`를 씁니다

출력 자체가 목적이라면 호출한 쪽에 정수 결과를 돌려줄 필요가 없을 수 있습니다. 다음은 그런 함수의 정의입니다.

```cpp
void printTotalArea(int totalArea)
{
    std::cout << "Total area: " << totalArea << '\n';
}
```

반환형 `void`는 **반환값이 없다**는 뜻입니다. 매개변수가 없다는 뜻은 아닙니다. 이 함수는 `int` 값 하나를 입력으로 받아 화면에 표시하고 끝납니다. 호출은 `printTotalArea(144);`처럼 작성합니다.

함수 본문의 끝에 도달하면 호출한 곳으로 돌아갑니다. 중간에 끝낼 필요가 있을 때는 값 없는 `return;`을 사용할 수 있지만, 지금처럼 마지막까지 수행하면 되는 함수에는 굳이 적지 않아도 됩니다.

`void` 함수의 호출 결과로 정수 변수를 초기화할 수는 없습니다. 예를 들어 `int area = printTotalArea(144);`는 잘못된 코드입니다. 화면에 `144`가 보이도록 작성했어도, 이 함수는 정수 값을 반환하지 않기 때문입니다.

## 7. 지역 변수와 값 매개변수는 자기 호출의 값입니다

함수 본문 안에서 선언한 변수는 **지역 변수**입니다. 앞에서 본 `oneCardArea`와 `totalArea`는 계산 함수 안에서 사용하는 이름입니다. `main`에서는 그 이름을 직접 사용할 수 없습니다. 필요한 결과를 `return`으로 받는 이유가 여기에 있습니다.

이번에 사용하는 보통의 지역 변수는 선언된 블록을 벗어나면 더 이상 사용할 수 없습니다. 함수 안의 `if` 블록에 선언한 변수라면 그 블록 밖에서도 직접 사용할 수 없습니다. 이전에 배운 중괄호의 범위가 함수 본문에도 적용된다고 생각하면 됩니다.

매개변수도 함수 안에서 사용하는 이름입니다. 이번에 배우는 `int` 매개변수는 호출할 때 전달한 정수 값을 받아 초기화되는 별도의 변수입니다. 이 방식을 **값 전달**이라고 부릅니다. 이 예제처럼 정수 값을 전달하면 함수 안에서 매개변수를 바꾸어도 호출한 쪽의 원래 변수가 바뀌지 않습니다. [Microsoft의 함수 설명](https://learn.microsoft.com/en-us/cpp/cpp/functions-cpp?view=msvc-170#function-parameters-and-arguments)에서도 값 전달의 기본 동작을 확인할 수 있습니다.

이를 직접 확인하는 완성 프로그램입니다. 파일 이름은 `02_local_copy.cpp`입니다.

```cpp
#include <iostream>

int addOne(int number)
{
    number = number + 1;
    return number;
}

int main()
{
    int number = 7;
    int nextNumber = addOne(number);

    std::cout << "Original: " << number << '\n';
    std::cout << "Returned: " << nextNumber << '\n';
}
```

예상 출력은 다음과 같습니다.

```text
Original: 7
Returned: 8
```

여기서는 차이를 확인하려고 일부러 두 위치에서 `number`라는 이름을 썼습니다. `main`의 `number`와 `addOne`의 매개변수 `number`는 서로 다른 변수입니다. 이름이 같다고 하나의 변수를 공유하는 것이 아닙니다.

호출할 때 `main`의 값 `7`로 매개변수를 초기화합니다. 함수 안의 대입은 매개변수만 `8`로 바꿉니다. 이어서 `8`을 반환하고, `main`은 그 값을 `nextNumber`에 저장합니다. 따라서 원래 값과 반환된 값을 동시에 확인할 수 있습니다.

원래 변수에 새 값을 반영하고 싶다면 호출하는 쪽에서 `number = addOne(number);`라고 명시적으로 대입하면 됩니다. 이때 원래 값이 바뀌는 이유는 함수 안의 대입이 아니라 **호출한 쪽에서 반환값을 다시 저장했기 때문**입니다.

지역 변수의 이름을 바깥에서 사용할 수 없다고 해서 계산 결과까지 사라져 쓸 수 없는 것은 아닙니다. 정수 반환값은 호출한 곳으로 전달됩니다. 첫 예제의 지역 변수 `totalArea`가 맡은 작업을 마친 뒤에도 `main`의 `smallCardArea`에는 전달받은 값 `144`가 남습니다.

## 8. 선언은 사용 방법을 알리고, 정의는 본문을 제공합니다

첫 프로그램에서는 계산 함수 전체를 `main` 위에 작성했습니다. 그래서 `main`에서 호출을 만났을 때 컴파일러가 함수의 이름과 자료형 정보를 이미 알 수 있었습니다.

반대로 `main`을 먼저 보여 주고 자세한 함수 본문을 아래에 배치하고 싶을 수도 있습니다. 이때는 호출보다 앞에 **함수 선언**을 적습니다.

```cpp
int calculateCardArea(int sideLength, int cardCount);
```

함수의 첫 줄과 비슷하지만 본문이 없고 세미콜론으로 끝납니다. “정수 두 개를 받아 정수를 돌려주는 함수가 있다”는 정보를 알립니다. 실제 계산 방법은 들어 있지 않습니다.

중괄호와 본문까지 작성하면 **함수 정의**입니다. 정의도 함수에 대한 정보를 알리므로 선언의 역할을 함께 합니다. 따라서 함수 정의를 호출보다 앞에 썼다면, 같은 함수의 별도 선언을 반드시 추가할 필요는 없습니다. [Microsoft의 선언과 정의 설명](https://learn.microsoft.com/en-us/cpp/cpp/declarations-and-definitions-cpp?view=msvc-170)에서 두 역할을 더 살펴볼 수 있습니다.

다음 완성 프로그램은 선언을 먼저 쓰는 배치입니다. 파일 이름은 `03_declaration_definition.cpp`입니다.

```cpp
#include <iostream>

int calculateCardArea(int sideLength, int cardCount);
void printTotalArea(int totalArea);

int main()
{
    int totalArea = calculateCardArea(6, 4);
    printTotalArea(totalArea);
}

int calculateCardArea(int sideLength, int cardCount)
{
    return sideLength * sideLength * cardCount;
}

void printTotalArea(int totalArea)
{
    std::cout << "Total area: " << totalArea << '\n';
}
```

예상 출력은 `Total area: 144` 한 줄입니다. 선언 자체가 계산을 실행하지는 않습니다. `main`에서 두 함수를 차례로 호출할 때 작업이 이루어집니다.

지금 다루는 일반 함수에서는 호출 위치보다 앞에서 해당 함수의 선언을 볼 수 있어야 합니다. 정의를 아래로 옮기고 위의 선언까지 지우면 “아래에 있으니 나중에 알아서 찾겠지”라고 기대할 수 없습니다. 이름을 알 수 없다는 컴파일 오류가 발생할 수 있습니다.

선언과 정의를 나누어 적을 때는 함수 이름, 반환형, 매개변수의 자료형과 순서를 일치시키세요. 선언의 매개변수 이름 자체는 정의와 달라도 되지만, 처음에는 같은 이름으로 작성하면 읽고 수정하기 쉽습니다.

또한 이번에 만드는 일반 함수의 정의는 `main`의 중괄호 밖에 둡니다. `main` 안에 다른 일반 함수의 정의를 중첩해서 넣지 않습니다. 별도 선언을 사용할지, 정의를 위에 둘지는 배치 선택입니다. 어느 쪽이든 함수를 호출할 때 필요한 정보가 먼저 보여야 한다는 원칙은 같습니다.

## 9. 입력 검사, 계산, 출력의 경계를 정해 봅시다

이제 사용자에게 카드 한 변의 길이와 개수를 입력받겠습니다. 한 변의 길이는 `1`부터 `30`, 개수는 `1`부터 `20`까지 허용합니다. 이 범위에서 최대 면적은 `18000`이므로 이번 예제의 정수 계산 범위를 작고 분명하게 유지할 수 있습니다.

작업을 세 가지로 설명할 수 있습니다.

- 입력이 정수 두 개이며 허용 범위에 들어오는지 확인하기
- 유효한 길이와 개수로 면적 계산하기
- 길이, 개수, 면적을 정해진 형식으로 출력하기

여기서는 입력과 검사를 `main`에 남깁니다. 계산은 `calculateCardArea`, 출력은 `printLayout`이 담당합니다. 입력받는 두 변수까지 다른 함수에서 처리하려고 아직 배우지 않은 전달 방법을 끌어올 필요는 없습니다. **지금 아는 도구로 경계를 명료하게 만드는 것**이 목표입니다.

계산 함수의 사용 조건도 정합니다. 호출하는 쪽이 허용 범위를 확인한 값만 전달합니다. 함수가 자동으로 모든 잘못된 값을 고쳐 주는 것은 아닙니다. 다른 프로그램에서 이 함수를 가져다 쓴다면 입력 조건도 함께 확인해야 합니다.

다음은 완성 프로그램 `04_checked_layout.cpp`입니다.

```cpp
#include <iostream>

int calculateCardArea(int sideLength, int cardCount)
{
    return sideLength * sideLength * cardCount;
}

void printLayout(int sideLength, int cardCount, int totalArea)
{
    std::cout << "Side length: " << sideLength << '\n';
    std::cout << "Card count: " << cardCount << '\n';
    std::cout << "Total area: " << totalArea << '\n';
}

int main()
{
    int sideLength = 0;
    int cardCount = 0;

    if (!(std::cin >> sideLength >> cardCount))
    {
        std::cout << "Enter two integers.\n";
        return 1;
    }

    if (sideLength < 1 || sideLength > 30 ||
        cardCount < 1 || cardCount > 20)
    {
        std::cout << "Allowed ranges: side 1-30, count 1-20.\n";
        return 1;
    }

    int totalArea = calculateCardArea(sideLength, cardCount);
    printLayout(sideLength, cardCount, totalArea);
}
```

입력으로 `6 4`를 주면 예상 출력은 다음과 같습니다.

```text
Side length: 6
Card count: 4
Total area: 144
```

`0 4`처럼 범위를 벗어나면 범위 안내문을 출력하고 종료합니다. `x 4`처럼 정수로 읽을 수 없는 입력이면 정수 두 개를 입력하라는 안내문을 출력하고 종료합니다. 실패한 경우에는 계산 함수까지 진행하지 않습니다.

이 입력 코드는 스트림에서 정수 두 개를 읽는 예제입니다. 한 줄 전체가 정확히 두 정수로만 이루어졌는지까지 검사하지는 않습니다. 예를 들어 두 정수 뒤에 남은 문자를 검사하는 코드는 포함하지 않았습니다. 여기서는 안내한 형식의 입력과 범위 검사, 그리고 함수로 이어지는 흐름에 집중합니다.

## 10. 함수로 나눌지 판단하는 세 질문

첫째, **이 묶음에 구체적인 이름을 붙일 수 있나요?** “카드 면적 계산”은 무엇을 하는지 알 수 있지만, “중간 처리”는 본문을 열기 전에는 알기 어렵습니다. 이름이 계속 모호하다면 서로 다른 일이 한데 들어 있는지 확인해 보세요.

둘째, **무엇을 받아 무엇을 돌려주는지 분명한가요?** 면적 계산에는 길이와 개수가 필요합니다. 화면에 어떤 제목을 표시할지는 필요하지 않습니다. 계산과 관계없는 입력이 계속 늘어난다면 함수가 여러 책임을 맡고 있을 수 있습니다.

셋째, **바뀌는 이유가 같은 코드끼리 묶였나요?** 카드 면적 공식이 바뀌는 것과 출력 문구를 바꾸는 것은 다른 변경입니다. 분리하면 어느 부분을 고칠지 더 쉽게 알 수 있습니다. 재사용 횟수가 아직 한 번이어도 이 구분이 유용할 수 있습니다.

반대로 이름을 붙여도 의미가 더 선명해지지 않고, 작은 계산을 확인하려고 여러 함수를 계속 오가야 한다면 지나치게 나눈 것일 수 있습니다. 한 줄 함수가 항상 좋은 것도, 긴 함수가 항상 나쁜 것도 아닙니다. 지금은 줄 수 제한을 외우기보다 책임과 값의 흐름을 설명하는 연습을 합니다.

## 11. 연습 문제

정답을 보기 전에 종이에 값의 이동을 적어 보세요. 오류 문제는 정상 예제와 구분해서 실행합니다. 실패하도록 만든 파일의 빌드 실패는 이 연습에서 관찰하려는 결과입니다.

### 문제 1. 함수의 약속 읽기

첫 번째 완성 프로그램의 `calculateCardArea`에 대해 답하세요.

1. 반환형과 매개변수 두 개의 이름은 무엇인가요?
2. `calculateCardArea(5, 2)`의 인수와 반환값은 무엇인가요?
3. 이 호출만 적었을 때 화면에 숫자가 표시되나요?
4. 호출한 `main`에서 `oneCardArea`라는 지역 변수를 직접 읽을 수 있나요?

### 문제 2. 연습 시간 계산하기

횟수와 한 회의 시간을 받아 전체 연습 시간을 돌려주는 `calculatePracticeMinutes`를 작성하세요. 두 매개변수와 반환형은 `int`입니다. 이번에는 쉬는 시간을 포함하지 않으며, 횟수는 `1`부터 `10`, 한 회의 시간은 `1`부터 `30`으로 제한합니다.

완성 프로그램에서 `5`회씩 `8`분인 계획과 `3`회씩 `6`분인 계획을 각각 계산한 뒤 두 결과를 한 줄씩 출력하세요. 계산 함수 안에서는 출력하지 않습니다.

### 문제 3. 출력한 숫자를 다음 계산에 쓰고 싶습니다

아래 함수는 값을 두 배로 만들어 출력합니다. 이 숫자를 호출한 쪽에서 저장하고, 거기에 `1`을 더한 값도 구하고 싶습니다.

```cpp
void showTwice(int value)
{
    std::cout << value * 2 << '\n';
}
```

반환값을 제공하는 `twice`로 바꾸고, `7`을 전달해 얻은 값과 그 값에 `1`을 더한 값을 출력하는 완성 프로그램을 작성하세요. 왜 `int doubled = showTwice(7);`로는 해결되지 않는지도 설명하세요.

### 문제 4. 같은 이름이면 같은 변수일까요?

`02_local_copy.cpp`를 다시 보세요. 함수 안에서 `number`를 바꾸었는데도 첫 출력이 `7`인 이유를 설명하세요. 또 `main`에서 `int nextNumber = addOne(number);` 다음 줄에 `number = nextNumber;`를 추가하면 두 출력이 각각 어떻게 달라지는지 예측하세요.

### 문제 5. 지역 변수에 접근한 오류 고치기

다음 완성 프로그램 `ex05_scope_error.cpp`는 의도적으로 컴파일 오류를 포함합니다. 실행하기 전에 어느 이름이 문제인지 찾아보세요.

```cpp
#include <iostream>

int calculateFrameWidth(int width)
{
    int margin = 2;
    return width + margin * 2;
}

int main()
{
    std::cout << margin << '\n';
}
```

테두리 안쪽 너비가 `10`이고 좌우 여백이 각각 `2`일 때 전체 너비를 출력하도록 고치세요. 여백을 전역 변수로 옮기지 말고, 함수가 돌려주는 값을 사용하세요.

### 문제 6. 선언은 있는데 실행 파일이 만들어지지 않습니다

다음 완성 프로그램 `ex06_missing_definition.cpp`에는 함수 선언과 호출이 있습니다. 하지만 의도적으로 정의를 빠뜨렸습니다.

```cpp
#include <iostream>

int calculateShelfLength(int boxWidth, int boxCount);

int main()
{
    std::cout << calculateShelfLength(12, 4) << '\n';
}
```

정수 두 개를 곱한 선반 길이를 돌려주는 정의를 추가하세요. 또 이 문제와 문제 5의 오류가 어떻게 다른지 설명하세요. 상자 너비는 `1`부터 `30`, 상자 개수는 `1`부터 `10`의 작은 정수라고 가정합니다.

## 12. 정답과 해설

### 정답 1. 선언된 이름과 전달된 값을 구별합니다

반환형은 `int`이고 매개변수 이름은 `sideLength`, `cardCount`입니다. 호출의 인수는 순서대로 `5`, `2`이며, 한 장의 면적 `25`에 개수 `2`를 곱하므로 반환값은 `50`입니다.

이 함수는 출력하지 않습니다. 반환값을 받는 코드와 `std::cout`을 사용하는 코드를 따로 작성해야 숫자를 볼 수 있습니다. `oneCardArea`는 계산 함수의 지역 변수이므로 `main`에서 직접 읽을 수 없습니다. `main`은 함수가 반환한 전체 면적을 받아 사용합니다.

### 정답 2. 같은 계산을 두 입력에 재사용합니다

완성 프로그램 `ex02_practice_minutes.cpp`입니다.

```cpp
#include <iostream>

int calculatePracticeMinutes(int roundCount, int minutesPerRound)
{
    return roundCount * minutesPerRound;
}

int main()
{
    int firstPlan = calculatePracticeMinutes(5, 8);
    int secondPlan = calculatePracticeMinutes(3, 6);

    std::cout << firstPlan << '\n';
    std::cout << secondPlan << '\n';
}
```

예상 출력은 첫 줄 `40`, 둘째 줄 `18`입니다. 횟수와 한 회의 시간은 매번 인수로 전달합니다. 함수 본문 안에 특정 계획의 숫자를 고정하지 않았으므로 동일한 계산 규칙을 두 계획에 사용할 수 있습니다.

### 정답 3. 계산 결과를 반환하고 출력은 호출한 쪽에서 합니다

완성 프로그램 `ex03_return_instead_of_output.cpp`입니다.

```cpp
#include <iostream>

int twice(int value)
{
    return value * 2;
}

int main()
{
    int doubled = twice(7);
    int nextValue = doubled + 1;

    std::cout << doubled << '\n';
    std::cout << nextValue << '\n';
}
```

예상 출력은 첫 줄 `14`, 둘째 줄 `15`입니다. 반환형을 `int`로 바꾸고, 계산한 값을 `return`으로 돌려줍니다. `main`은 반환값을 `doubled`에 저장하므로 다음 계산에서도 사용할 수 있습니다.

원래의 `showTwice`는 반환형이 `void`입니다. 화면으로 숫자를 보내는 동작은 있지만, 정수 변수를 초기화할 반환값은 없습니다. 따라서 `int doubled = showTwice(7);`는 잘못된 코드입니다.

### 정답 4. 반환값을 대입할 때 원래 변수도 바뀝니다

`addOne`의 매개변수는 `main`의 변수와 다른 변수이며, 호출 시점의 정수 값으로 초기화됩니다. 함수 안에서 변경한 것은 그 매개변수입니다. 그래서 원래 프로그램은 `Original: 7`, `Returned: 8`을 출력합니다.

`number = nextNumber;`를 추가하면 호출한 쪽에서 반환받은 `8`을 원래 변수에 대입합니다. 그 뒤의 예상 출력은 `Original: 8`, `Returned: 8`입니다. 함수가 원래 변수를 직접 고친 것이 아니라, `main`에 추가한 대입문이 값을 바꾸었다고 설명할 수 있어야 합니다.

### 정답 5. 지역 변수 이름 대신 반환값을 사용합니다

`main`에서 사용한 `margin`이 문제입니다. 이 이름은 `calculateFrameWidth` 본문 안에서 선언되었으며, `main`에서는 사용할 수 없습니다. 아직 실행하기 전, 컴파일 단계에서 이름을 찾지 못하는 오류입니다. 정확한 진단 문구는 컴파일러마다 다를 수 있습니다.

완성 프로그램 `ex05_scope_fixed.cpp`입니다.

```cpp
#include <iostream>

int calculateFrameWidth(int width)
{
    int margin = 2;
    return width + margin * 2;
}

int main()
{
    int frameWidth = calculateFrameWidth(10);
    std::cout << frameWidth << '\n';
}
```

예상 출력은 `14` 한 줄입니다. 함수에 안쪽 너비 `10`을 전달하고 계산된 전체 너비를 받습니다. 여백 변수를 바깥으로 꺼내지 않아도 필요한 결과를 전달할 수 있습니다.

### 정답 6. 선언에 대응하는 정의를 제공합니다

완성 프로그램 `ex06_definition_added.cpp`입니다.

```cpp
#include <iostream>

int calculateShelfLength(int boxWidth, int boxCount);

int main()
{
    std::cout << calculateShelfLength(12, 4) << '\n';
}

int calculateShelfLength(int boxWidth, int boxCount)
{
    return boxWidth * boxCount;
}
```

예상 출력은 `48` 한 줄입니다. 위의 선언이 호출에 필요한 정보를 제공하고, 아래의 정의가 실제 계산 방법을 제공합니다. 선언만으로는 함수 본문이 저절로 만들어지지 않습니다.

문제 5는 호출한 코드에서 변수 이름을 알 수 없는 컴파일 오류입니다. 문제 6에서는 선언 덕분에 함수의 이름, 매개변수, 반환형을 알 수 있습니다. 그러나 실행 파일에 연결해야 할 실제 정의가 없습니다. 일반적인 빌드 도구에서는 링크 단계에서 정의를 찾을 수 없다는 오류가 나타납니다.

빌드를 한 번에 수행하는 편집기에서는 둘 다 “빌드 실패”로 보일 수 있습니다. 메시지에 선언되지 않은 이름이 나오는지, 연결할 정의를 찾지 못했다는 내용이 나오는지 읽는 습관을 들이세요. 두 경우의 해결 방법은 다릅니다.

Visual Studio의 출력 창에서 문제 5는 컴파일 오류, 문제 6은 연결 오류로 구분해 읽습니다. 단계를 직접 나누어 확인하려면 Visual Studio의 x64 Native Tools Command Prompt를 열고 예제 폴더로 이동합니다. `cl /nologo /std:c++20 /EHsc /utf-8 /c ex06_missing_definition.cpp /Fomissing.obj`는 객체 파일까지만 만드는 명령입니다. 이어서 `cl /nologo missing.obj /Femissing.exe`를 실행하면 호출한 함수의 정의가 없어 링크가 실패할 것으로 예상됩니다. `cl`을 찾지 못한다면 일반 명령 프롬프트가 아니라 Visual Studio 개발자 명령 프롬프트인지 확인하세요. `/c`의 동작은 [Microsoft의 컴파일 전용 옵션 설명](https://learn.microsoft.com/en-us/cpp/build/reference/c-compile-without-linking?view=msvc-170)에서 확인할 수 있습니다.

## 마무리: 함수의 경계에는 값과 약속이 있습니다

함수를 만들 때는 본문부터 잘라 옮기기보다 다음 문장을 먼저 완성해 보세요. “이 함수는 무엇을 받아, 어떤 일을 하고, 무엇을 돌려준다.” 반환값이 없다면 무엇을 수행하고 끝나는지 설명하면 됩니다.

마지막으로 코드 없이 다음을 말할 수 있는지 확인해 보세요.

- 매개변수는 함수가 받는 자리이고, 인수는 호출할 때 건네는 값입니다.
- `return`은 현재 함수를 끝내며, 반환값이 있으면 호출한 곳에 전달합니다.
- `std::cout`으로 출력했다고 정수 반환값이 생기는 것은 아닙니다.
- `void`는 반환값이 없다는 뜻이며, 매개변수는 있을 수 있습니다.
- 이번의 정수 값 매개변수를 바꾸어도 호출한 쪽의 변수는 자동으로 바뀌지 않습니다.
- 지역 변수는 자신이 선언된 범위에서 사용합니다.
- 호출 전에는 함수의 선언을 볼 수 있어야 하고, 실제 호출할 함수의 정의도 필요합니다.
- 나눌 기준은 정해진 줄 수보다 함수가 맡은 일과 값의 흐름입니다.

이제 앞에서 만든 작은 프로그램을 다시 보면서, 계산 한 가지에 이름을 붙이고 필요한 값을 매개변수로 전달해 보세요. 한 번에 모든 부분을 함수로 바꾸지 않아도 됩니다. 반환받은 값이 원래 프로그램과 같은 결과를 만드는지 확인하면서 경계를 하나씩 정하면 됩니다.

## 예제 내려받기

각 파일은 별도 프로젝트로 실행하거나, 프로젝트에 실행할 `.cpp` 파일 하나만 포함하세요. 문제 5의 범위 오류 파일과 문제 6의 정의 누락 파일은 의도적으로 빌드에 실패하는 연습 예제입니다. 정답 파일과 구분하여 사용하세요.

- [카드 면적 계산](/cpp-jeongseok/assets/examples/02-1/01_card_area.cpp)
- [값 매개변수와 원래 변수](/cpp-jeongseok/assets/examples/02-1/02_local_copy.cpp)
- [선언과 정의를 나눈 배치](/cpp-jeongseok/assets/examples/02-1/03_declaration_definition.cpp)
- [입력 검사·계산·출력](/cpp-jeongseok/assets/examples/02-1/04_checked_layout.cpp)
- [문제 2 정답: 연습 시간 계산](/cpp-jeongseok/assets/examples/02-1/ex02_practice_minutes.cpp)
- [문제 3 정답: 출력 대신 반환](/cpp-jeongseok/assets/examples/02-1/ex03_return_instead_of_output.cpp)
- [문제 5: 지역 변수 범위 오류 (컴파일 실패 예제)](/cpp-jeongseok/assets/examples/02-1/ex05_scope_error.cpp)
- [문제 5 정답: 반환값 사용](/cpp-jeongseok/assets/examples/02-1/ex05_scope_fixed.cpp)
- [문제 6: 정의 누락 (링크 실패 예제)](/cpp-jeongseok/assets/examples/02-1/ex06_missing_definition.cpp)
- [문제 6 정답: 정의 추가](/cpp-jeongseok/assets/examples/02-1/ex06_definition_added.cpp)
