## 조건에 따라 고르고, 필요한 만큼 되풀이하기

앞 수업에서는 값을 계산하고 비교했습니다. 이번에는 그 비교 결과로 실행할 코드를 고릅니다. 같은 작업을 여러 번 해야 할 때에는 반복문을 사용합니다. 코드를 짧게 만드는 것보다 먼저 확인할 것은 ‘어떤 조건에서 실행하고, 언제 멈추는가’입니다.

이번 수업을 마치면 `if`와 `switch`의 실행 경로를 경계값으로 예측하고, `for`와 `while`의 실행 순서를 추적할 수 있습니다. `break`와 `continue`의 대상을 구분하고, 반복 횟수가 한 번 어긋나는 문제도 수정해 봅니다. 함수와 배열, 사용자 입력은 아직 필요하지 않습니다.

## 1. `if`: 조건에 따라 한쪽 고르기

회복 아이템을 사용하려면 체력이 최대치보다 작아야 한다고 정해 보겠습니다. 다음 프로그램은 어느 문장을 출력할까요?

```cpp
#include <iostream>

int main()
{
    const int health{70};
    const int max_health{100};

    if (health < max_health) {
        std::cout << "Can heal" << '\n';
    } else {
        std::cout << "Already full" << '\n';
    }
}
```

`health < max_health`는 `true`이므로 `Can heal`만 출력합니다. `if`의 조건이 `true`이면 첫 블록을, `false`이면 `else` 블록을 실행합니다. `else`가 없다면 `false`일 때 해당 `if`의 본문을 건너뜁니다. 블록 다음 문장은 선택한 블록을 마친 뒤 이어서 실행합니다.

이 강좌에서는 본문이 한 문장이더라도 중괄호를 사용합니다. C++ 문법상 늘 필요한 것은 아니지만, 나중에 문장을 추가했을 때 실행 범위를 잘못 읽는 일을 줄일 수 있습니다. 여기서는 일반 줄바꿈에 `'\n'`을 사용합니다. 앞의 Hello World 예제에서 사용한 `std::endl`은 줄바꿈과 함께 출력 버퍼의 flush도 요청한다는 차이가 있습니다.

실습: `health`를 99, 100, 101로 바꾸고 각각의 출력을 예상한 뒤 실행해 보세요. 101도 `Already full`이 나옵니다. 이 코드는 ‘최대 체력 이상이면 회복하지 않는다’만 판단하며, 101이라는 상태가 유효한지까지 검사하지는 않습니다. 조건식이 실제로 보장하는 범위를 구분해야 합니다.

<figure class="concept-figure">
<a href="/cpp-jeongseok/assets/illustrations/01-3-branch-loop.webp"><img src="/cpp-jeongseok/assets/illustrations/01-3-branch-loop.webp" alt="흰 배경에서 로봇이 도형을 두 레인으로 분류하고, 다른 로봇이 작업대의 블록을 하나씩 확인하는 모습" width="1200" height="800" loading="lazy" decoding="async"></a>
<figcaption>AI 생성 개념 일러스트: 조건에 따라 처리할 길을 고르는 분기와, 같은 작업을 거듭 수행하는 반복을 비유했습니다. 실제 코드의 실행 순서나 종료 조건을 정확하게 나타낸 순서도는 아닙니다.</figcaption>
</figure>

## 2. `else if`: 조건을 검사하는 순서도 중요합니다

점수에 따라 보상을 하나만 고른다면 조건을 어떻게 배치해야 할까요?

```cpp
#include <iostream>

int main()
{
    const int score{85};

    if (score >= 90) {
        std::cout << "Gold" << '\n';
    } else if (score >= 70) {
        std::cout << "Silver" << '\n';
    } else {
        std::cout << "Bronze" << '\n';
    }
}
```

85는 첫 조건을 만족하지 않고 두 번째 조건을 만족하므로 `Silver`를 출력합니다. 이 연결에서는 앞에서 선택된 블록이 있으면 뒤의 조건을 더 검사하지 않습니다. 따라서 `Silver`를 출력하는 `score >= 70` 분기 전체를 `Gold` 분기보다 먼저 놓으면 95도 `Silver`로 선택됩니다. 조건을 많이 적는 것만으로 정확해지지 않습니다.

독립된 `if` 두 개는 다릅니다. 두 조건을 각각 검사하므로 두 본문이 모두 실행될 수 있습니다. ‘하나만 선택’이면 `if`/`else if`, ‘조건마다 별도로 수행’이면 독립된 `if`가 자연스럽습니다.

주의: `==`는 값 비교이고 `=`는 대입입니다. `if (score = 70)`처럼 대입 결과가 조건으로 사용되는 코드는 경우에 따라 컴파일됩니다. `const` 여부와 경고 설정에 따라 진단이 달라지므로, ‘오타라면 컴파일러가 항상 막는다’고 기대하지 않습니다.

## 3. `switch`: 정해진 값으로 갈라지기

명령 번호가 1이면 공격, 2이면 방어, 그 외이면 대기라고 정해 보겠습니다. 번호와 같은 값을 찾는 작업에는 `switch`를 사용할 수 있습니다.

```cpp
#include <iostream>

int main()
{
    const int command{2};

    switch (command) {
    case 1: {
        std::cout << "Attack" << '\n';
        break;
    }
    case 2: {
        std::cout << "Defend" << '\n';
        break;
    }
    default: {
        std::cout << "Wait" << '\n';
        break;
    }
    }
}
```

결과는 `Defend`입니다. `case`는 시작할 위치를 표시하고, `break`는 이 `switch`를 빠져나갑니다. `case`의 중괄호를 닫는 것만으로 `switch`가 끝나는 것은 아닙니다. `break`를 빼면 다음 `case`의 문장으로 실행이 이어질 수 있습니다. 이를 fallthrough라고 부릅니다. 의도한 경우에는 `[[fallthrough]];`로 표시할 수 있지만, 지금은 각 명령이 하나의 동작만 수행하도록 `break`를 유지합니다.

`default`는 일치하는 `case`가 없을 때 선택됩니다. 일치하는 `case`도 `default`도 없다면 `switch` 본문을 실행하지 않고 지나갑니다. 같은 `switch`에 값이 같은 `case`를 두 번 적을 수 없으며, `case` 값은 컴파일 때 확정되는 상수식이어야 합니다.

이 수업은 `int` 값으로 분기합니다. `switch`는 정수와 열거형, 또는 이들로 적절히 변환되는 클래스 타입을 다루며, 임의의 실수 구간이나 문자열을 그대로 비교하는 용도가 아닙니다. `score >= 90` 같은 범위 조건은 `if`로 표현하는 편이 맞습니다. `case` 안에 지역 변수를 선언할 때에도 예제처럼 블록으로 구분하면 다른 `case`로 이동하며 초기화를 건너뛰는 문제를 피하기 쉽습니다.

실습: `command`를 1, 2, 9로 바꾸어 세 경로를 확인해 보세요. 그다음 첫 `case`의 `break`만 지우고 `command`가 1일 때 어떤 출력이 이어지는지 확인합니다. 다른 코드는 그대로 둡니다.

## 4. `for`: 횟수가 보이는 반복

작업을 세 번 수행한다면 문장을 세 번 복사하기보다 반복 범위를 표현합니다.

```cpp
#include <iostream>

int main()
{
    const int count{3};

    for (int step{0}; step < count; ++step) {
        std::cout << step << '\n';
    }

    std::cout << "Done" << '\n';
}
```

출력은 0, 1, 2, `Done`이 각각 한 줄씩입니다. `++step`은 `step`을 1 증가시킵니다. `for`의 괄호 안은 초기화, 조건, 갱신으로 나뉩니다. 읽는 순서와 매번 실행되는 순서를 구분하세요.

1. `int step{0}`으로 한 번 초기화합니다.
2. `step < count`를 검사합니다. `false`이면 반복을 끝냅니다.
3. `true`이면 본문을 실행합니다.
4. `++step`을 실행하고 2번으로 돌아갑니다.

추적: `step=0`에서 조건 `true`, 출력 0, 갱신 후 1입니다. `step=1`과 2에서도 본문을 실행합니다. `step=3`에서 조건이 `false`가 되어 본문을 실행하지 않습니다. 이 예제는 본문 세 번, 조건 검사 네 번입니다. 중간에 `break`나 `return`으로 빠져나가는 반복에도 무조건 ‘조건은 횟수+1번’이라고 적용하면 안 됩니다.

0부터 시작하고 끝값을 포함하지 않는 `[0, count)` 범위는 `count`개를 처리하기 편합니다. `count=0`이면 처음부터 `false`여서 본문은 한 번도 실행되지 않습니다. `step <= count`로 바꾸면 `count=3`에서 0, 1, 2, 3의 네 번이 됩니다. 이 차이가 대표적인 한 칸 초과 오류입니다.

`step`은 `for` 안에서 선언했으므로 `for`가 끝난 뒤에는 그 이름을 사용할 수 없습니다. 또한 반복 횟수가 매우 크다면 갱신 중 타입의 표현 범위를 넘지 않는지도 따져야 합니다. 지금 예제의 작은 값에서는 그런 문제가 없습니다.

## 5. `while`: 상태가 조건을 만족하는 동안

남은 작업량이 0이 될 때까지 처리하는 상황을 살펴보겠습니다.

```cpp
#include <iostream>

int main()
{
    int remaining{3};

    while (remaining > 0) {
        std::cout << remaining << '\n';
        --remaining;
    }

    std::cout << "Done" << '\n';
}
```

3, 2, 1, `Done`을 차례로 출력합니다. `--remaining`은 값을 1 줄입니다. `while`은 본문에 들어가기 전에 조건을 검사합니다. 처음부터 `remaining`이 0이면 본문은 실행하지 않습니다.

반복문을 읽을 때에는 시작 상태, 계속할 조건, 상태를 바꾸는 문장 세 가지를 함께 봅니다. 이 예제는 남은 양이 양수일 때만 들어가고 매번 1씩 줄어드므로 0에 도달합니다. `--remaining`을 지우면 출력하면서도 값이 바뀌지 않아 정상적으로 끝나지 않습니다. 실행해서 기다리기보다 상태 변화를 먼저 추적해 보는 편이 좋습니다.

`for`는 초기화와 갱신을 한곳에서 읽기 쉽고, `while`은 계속할 조건을 앞세워 읽기 쉽습니다. 어느 쪽이 항상 더 빠르다는 규칙은 없습니다. 처리 의도가 잘 드러나는 쪽을 고릅니다. 적어도 한 번 실행한 뒤 조건을 검사하는 `do`/`while`도 있지만, 이번 실습은 실행 전 조건 검사에 집중합니다.

## 6. `break`와 `continue`: 어디로 이동하는가

1부터 5까지 확인하되 3은 건너뛰고, 5를 만나면 끝내 보겠습니다.

```cpp
#include <iostream>

int main()
{
    for (int value{1}; value <= 5; ++value) {
        if (value == 3) {
            continue;
        }

        if (value == 5) {
            break;
        }

        std::cout << value << '\n';
    }

    std::cout << "Done" << '\n';
}
```

출력은 1, 2, 4, `Done`입니다. `continue`는 이번 회차의 남은 본문을 건너뜁니다. 이 `for`에서는 곧바로 갱신식 `++value`를 실행한 뒤 조건을 다시 검사합니다. `break`는 가장 가까운 반복문 또는 `switch`를 종료합니다. 여기서는 `for`를 끝내므로 `value=5`에서 출력도 갱신식도 실행하지 않습니다.

`while`의 `continue`는 조건 검사로 이동합니다. 따라서 `while` 본문 아래쪽에만 값의 갱신을 두고 그 앞에서 `continue`하면 갱신을 건너뛸 수 있습니다. `for`를 `while`로 기계적으로 옮길 때 특히 주의해야 하는 차이입니다.

중첩되어 있어도 `break`가 모든 바깥 반복을 한꺼번에 끝내지는 않습니다. 반복 안의 `switch`에서 사용한 `break`는 그 `switch`만 끝냅니다. `continue`는 반복문을 대상으로 하므로 `switch` 안에 있더라도 둘러싼 반복문의 다음 회차로 이동합니다. 아직 중첩이 복잡하다면 한 단계씩 추적하세요.

## 7. 경계값으로 확인하기

분기에서는 조건의 바로 아래, 같은 값, 바로 위를 시험합니다. 보상 예제라면 69·70·71, 89·90·91이 경계입니다. 반복에서는 0번, 1번, 여러 번을 확인합니다. 정상 예제만 한 번 실행해 보아서는 `<`와 `<=`의 차이를 놓치기 쉽습니다.

종료는 ‘언젠가 될 것’이라는 기대 대신 근거로 설명합니다. 이번 `remaining` 예제는 양수인 정수가 한 번에 1씩 감소합니다. 다른 코드에서는 증가 방향이 잘못되거나, `continue`가 갱신을 건너뛰거나, 조건에 쓰는 값이 다른 곳에서 바뀔 수 있습니다. 모든 반복이 같은 이유로 종료되는 것은 아닙니다.

빈 본문도 주의하세요. `while (remaining > 0);` 뒤의 세미콜론은 빈 문장 하나를 본문으로 만듭니다. 바로 아래 중괄호가 기대한 반복 본문이 아닐 수 있습니다. 경고를 켜고, 중괄호와 세미콜론의 위치를 함께 확인합니다. 무한 반복이나 오버플로를 일부러 오래 실행할 필요는 없습니다.

## 8. 직접 풀어보기

문제 1. 보상 예제에서 `score`가 69, 70, 89, 90일 때의 출력을 적으세요. `Silver`를 출력하는 `score >= 70` 분기 전체를 `Gold` 분기보다 먼저 배치하면 90은 어떻게 달라질까요?

문제 2. 0부터 4까지 한 줄씩 출력하는 `for`를 작성하세요. 5는 출력하지 않습니다. 종료 직전의 조건 검사에서 변수는 어떤 값인가요?

문제 3. `remaining`을 0으로 시작하는 `while` 예제에서 출력은 무엇인가요? 남은 양을 3으로 바꾸고 `--remaining` 대신 `++remaining`을 사용하면, ‘끝나지 않기만 한다’고 안전하게 설명할 수 있을까요?

문제 4. `switch` 예제에서 `command=1`이고 첫 `case`의 `break`만 제거했습니다. 출력과 마지막으로 빠져나오는 위치를 설명하세요. 모든 `break`를 삭제한 상황과 혼동하지 마세요.

문제 5. 1부터 6까지의 짝수만 더하고 합을 출력하세요. `for`와 `continue`를 사용합니다. 합을 보관할 변수는 반복 전에 0으로 초기화합니다.

문제 6. 다음 조각의 종료 문제를 찾아 갱신을 빠뜨리지 않는 `while`로 수정하세요. 이 코드는 그대로 실행하지 말고 먼저 추적합니다.

```cpp
int value{0};
while (value < 3) {
    if (value == 1) {
        continue;
    }
    std::cout << value << '\n';
    ++value;
}
```

## 9. 해설과 확인

문제 1. 순서대로 `Bronze`, `Silver`, `Silver`, `Gold`입니다. `Silver` 분기를 먼저 배치하면 90도 그 조건에 걸려 `Silver`가 됩니다. 하나만 고르는 연결에서는 넓은 조건을 먼저 두었을 때 뒤 조건에 도달하지 못할 수 있습니다.

문제 2. 다음과 같이 끝값을 제외합니다. 본문을 마지막으로 실행할 때는 `index=4`이고, 다음 조건 검사에서는 `index=5`이므로 `false`입니다.

```cpp
for (int index{0}; index < 5; ++index) {
    std::cout << index << '\n';
}
```

문제 3. 0으로 시작하면 `Done`만 출력합니다. 3에서 계속 증가시키면 양수 조건에서 벗어나지 않으며, 결국 `signed int`의 최대값에서 증가할 때 미정의 동작에 이릅니다. 따라서 그 이후 동작을 ‘계속 증가한다’거나 ‘음수로 돌아온다’고 보장할 수 없습니다. 종료 방향과 표현 범위를 함께 봅니다.

문제 4. `Attack` 다음에 `Defend`를 출력합니다. 첫 `case` 블록이 끝나도 다음 `case`로 이어지며, 두 번째 `case`의 `break`에서 `switch`를 빠져나갑니다. `default`의 `Wait`까지 출력하지는 않습니다.

문제 5. 나머지가 0이 아닌 값을 건너뛰면 됩니다. 결과는 12입니다. `continue` 이후에도 `for`의 `++value`는 실행됩니다.

```cpp
int total{0};
for (int value{1}; value <= 6; ++value) {
    if (value % 2 != 0) {
        continue;
    }
    total += value;
}
std::cout << total << '\n';
```

문제 6. `value=1`이 되면 `continue`가 `++value`를 계속 건너뜁니다. 다음처럼 출력 여부만 분기하고 갱신은 매 회차 실행하면 0과 2를 출력한 뒤 종료합니다.

```cpp
int value{0};
while (value < 3) {
    if (value != 1) {
        std::cout << value << '\n';
    }
    ++value;
}
```

해설의 코드 조각은 `#include <iostream>`을 둔 파일의 `int main()` 중괄호 안에 넣어 각각 실행합니다. 선언 이름이 겹치지 않도록 예제는 한 번에 하나씩 확인합니다.

## 정리

`if`는 참과 거짓으로, `switch`는 정해진 값으로 경로를 고릅니다. `for`와 `while`은 조건을 다시 확인하며 작업을 반복합니다. 문법을 외우는 것보다 시작 값, 조건, 본문, 갱신, 빠져나오는 위치를 순서대로 읽는 것이 중요합니다. 다음 수업에서는 이 흐름에 사용자 입력과 검증을 더해 작은 콘솔 프로그램으로 묶어 봅니다.

## 참고 자료

C++20 공개 작업 초안 N4861의 `if`, `switch`, 반복문, jump 문장 규정을 확인할 수 있습니다. 아래 자료는 원문을 찾아보고 싶은 독자를 위한 것으로, 입문 실습에 전체 규정의 정독이 필요한 것은 아닙니다.
https://timsong-cpp.github.io/cppwp/n4861/stmt.if
https://timsong-cpp.github.io/cppwp/n4861/stmt.switch
https://timsong-cpp.github.io/cppwp/n4861/stmt.iter
https://timsong-cpp.github.io/cppwp/n4861/stmt.jump

## 실행 예제 내려받기

각 파일을 별도 C++20 콘솔 프로그램으로 빌드합니다.

- [예제 01_if (.cpp)](/cpp-jeongseok/assets/examples/01-3/01_if.cpp)
- [예제 02_else_if (.cpp)](/cpp-jeongseok/assets/examples/01-3/02_else_if.cpp)
- [예제 03_switch (.cpp)](/cpp-jeongseok/assets/examples/01-3/03_switch.cpp)
- [예제 04_for (.cpp)](/cpp-jeongseok/assets/examples/01-3/04_for.cpp)
- [예제 05_while (.cpp)](/cpp-jeongseok/assets/examples/01-3/05_while.cpp)
- [예제 06_break_continue (.cpp)](/cpp-jeongseok/assets/examples/01-3/06_break_continue.cpp)
