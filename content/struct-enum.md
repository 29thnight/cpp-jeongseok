작은 편집팀에서 원고 작업을 관리한다고 해 봅시다. 작업마다 제목, 담당자, 예상 시간이 있고, 진행 상태도 기록해야 합니다. 제목 목록과 담당자 목록을 따로 만들면 같은 위치의 값들이 한 작업을 가리킨다는 약속을 계속 지켜야 합니다. 작업 하나를 전달할 때도 인자가 늘어납니다.

이번 절에서는 관련된 값을 `struct`로 묶어 `Task`라는 타입을 만들고, 진행 상태는 `enum class`로 이름 붙입니다. 이어서 앞 절에서 익힌 const 참조와 값 반환을 사용자 정의 타입에도 적용합니다. 마지막에는 여러 작업을 모아 완료 개수와 미완료 작업의 예상 시간을 계산합니다.

## 이번 절을 마치면

1. 작업의 제목·담당자·예상 시간을 가진 `struct`를 정의하고, 중괄호로 객체를 초기화한 뒤 점으로 멤버를 읽고 변경할 수 있습니다.
2. `enum class`로 상태를 선언하고, 입력 숫자를 검사한 뒤 이름 있는 상태로 연결하여 출력할 수 있습니다.
3. 사용자 정의 타입을 const 참조로 받거나 값으로 반환하는 함수를 작성하고, 빈 경우까지 포함해 `vector<Task>`를 집계할 수 있습니다.

## 1 관련된 값에 하나의 타입 이름 붙이기

### 먼저 예측하기

다음 예제를 실행하기 전에 마지막 줄에 출력될 예상 시간을 적어 보세요. 처음 적힌 30과 나중에 적힌 45 중 어느 값이 사용될까요?

예제 1 · `examples/01_task_record.cpp`

```cpp
#include <iostream>
#include <string>

struct Task {
    std::string title;
    std::string owner;
    int plannedMinutes = 0;
};

int main() {
    Task task{"Review", "Mina", 30};

    task.plannedMinutes = 45;

    std::cout << task.title << " / " << task.owner << " / "
              << task.plannedMinutes << '\n';
}
```

예상 출력:

```text
Review / Mina / 45
```

### 타입과 객체를 구별하기

`struct Task { ... };`는 `Task`라는 타입을 정의합니다. 중괄호 안의 `title`, `owner`, `plannedMinutes`는 이 타입의 멤버입니다. 타입 정의 끝에는 세미콜론이 필요합니다. 함수 정의의 닫는 중괄호 뒤와 혼동하지 마세요.

`Task task{...};`는 그 타입의 객체 하나를 만듭니다. 여기서 `Task`는 타입 이름이고 `task`는 객체 이름입니다. 타입 정의만으로 편집팀의 특정 작업이 생기는 것은 아닙니다. `int`라는 타입과 `int count = 3;`의 변수 `count`를 구분했던 것과 같은 생각입니다.

`task.plannedMinutes`처럼 객체 이름 뒤에 점을 쓰면 그 객체의 멤버를 선택합니다. 이 식으로 값을 읽을 수도 있고 새 값을 대입할 수도 있습니다. 예제는 `task`의 예상 시간을 45로 바꾼 다음 출력하므로 45가 나옵니다. 같은 타입의 다른 객체를 만든다고 해서 그 객체의 예상 시간까지 바뀌지는 않습니다.

![한 Task에 제목, 담당자, 예상 시간, 상태가 묶이고 상태는 Todo, Doing, Done 중 이름으로 표현되는 개념 그림](/cpp-jeongseok/assets/illustrations/03-1-task-state.webp)

그림 03-1 · AI 생성 개념 일러스트. 작업과 관련 값, 상태 이름의 관계를 보여 줍니다. 실제 메모리 배치나 멤버 크기·주소·정렬을 나타낸 그림은 아닙니다.

### 직접 바꾸기

예제 1에서 `task.owner = "Joon";`을 출력 전에 추가하세요. 출력에서 담당자만 바뀌는지 확인하세요. 이어서 `Task another{"Publish", "Mina", 10};`을 만들고 `another.plannedMinutes`도 출력해 보세요. 같은 멤버 이름을 사용해도 어느 객체의 값을 선택하는지에 따라 결과가 다릅니다.

## 2 초기값을 정하고 객체를 복사하기

### 먼저 예측하기

다음 예제에는 기본값만 사용하는 객체, 일부 값만 지정한 객체, 다른 객체를 복사한 객체가 있습니다. `copy`의 담당자와 시간을 바꾸면 `original`도 바뀔까요?

예제 2 · `examples/02_initialization_copy.cpp`

```cpp
#include <iostream>
#include <string>

struct Task {
    std::string title = "Untitled";
    std::string owner = "Unassigned";
    int plannedMinutes = 15;
};

int main() {
    Task empty{};
    Task original{"Review", "Mina", 30};
    Task copy = original;
    Task partial{"Outline"};

    copy.owner = "Joon";
    copy.plannedMinutes = 50;

    std::cout << empty.title << " / " << empty.plannedMinutes << '\n';
    std::cout << partial.title << " / " << partial.owner << " / "
              << partial.plannedMinutes << '\n';
    std::cout << original.owner << " / " << original.plannedMinutes << '\n';
    std::cout << copy.owner << " / " << copy.plannedMinutes << '\n';
}
```

예상 출력:

```text
Untitled / 15
Outline / Unassigned / 15
Mina / 30
Joon / 50
```

### 멤버 기본 초기화와 중괄호의 순서

`int plannedMinutes = 15;`처럼 타입 정의 안에 기본값을 써 두는 것을 멤버 기본 초기화라고 합니다. `Task empty{};`처럼 개별 값을 지정하지 않으면 이 예제에서는 각 멤버의 기본값을 사용합니다. `empty`는 객체 이름일 뿐, 멤버가 모두 비었다는 뜻은 아닙니다.

`Task original{"Review", "Mina", 30};`의 값은 **멤버를 선언한 순서**에 맞춰 들어갑니다. 첫째는 `title`, 둘째는 `owner`, 셋째는 `plannedMinutes`입니다. 여기서 사용하는 단순한 구조체의 이러한 초기화를 집계 초기화라고 부릅니다.

`Task partial{"Outline"};`처럼 앞부분만 지정하면 `title`에는 지정한 값을 넣고, 생략한 `owner`와 `plannedMinutes`에는 멤버 기본값을 사용합니다. 이 형태에서 생략된 멤버에 기본값도 없다면 빈 중괄호로 초기화한 것처럼 처리됩니다. 예를 들어 `int`는 0, `std::string`은 빈 문자열이 됩니다.

반면 기본값 없는 `int` 멤버가 있는 구조체를 함수 안에서 `Task task;`처럼 중괄호 없이 만들면 그 정수 값이 자동으로 0이 된다고 생각해서는 안 됩니다. 값을 넣기 전에 읽지 않아야 합니다. 이 절에서는 기본값을 명시하고 객체를 중괄호로 초기화하는 습관을 사용합니다.

선언 순서를 틀리면 컴파일러가 언제나 알려 줄까요? 다음 초기화는 `title`과 `owner`가 둘 다 문자열이므로 컴파일되지만 의도와 다를 수 있습니다.

```cpp
Task mistaken{"Mina", "Review", 30};
```

이 객체의 제목은 `Mina`, 담당자는 `Review`입니다. 컴파일러는 두 문자열 중 무엇이 사람 이름인지 모릅니다. 멤버를 추가하거나 순서를 바꿀 때는 기존 초기화 목록도 함께 검토해야 합니다.

### 복사는 같은 객체에 붙인 새 이름이 아니다

`Task copy = original;`은 새 객체 `copy`를 만들고 각 멤버를 복사합니다. 이 절에서 사용하는 `std::string`, `int`, 열거형 멤버는 값을 복사하여 사용하므로, 복사본의 값을 바꿔도 원본 값은 바뀌지 않습니다. 이 설명을 앞으로 배울 모든 종류의 멤버에 무조건 확대하지는 마세요.

앞 절의 참조와도 구분해야 합니다. `const Task& view = original;`은 원본을 읽는 참조이고 새 `Task` 복사본이 아닙니다. `Task copy = original;`과 겉모양이 비슷해도 의미가 다릅니다.

### 직접 바꾸기

`copy.title = "Final review";`를 추가하고 원본과 복사본의 제목을 각각 출력하세요. 그런 다음 `partial`의 초기화에 담당자도 지정해 보세요. 예상 시간의 기본값은 그대로 사용되는지 관찰하세요.

## 3 숫자 대신 상태 이름 사용하기

작업 상태를 정수 0, 1, 2로 정하면 `state == 1`이 무슨 뜻인지 별도로 기억해야 합니다. `enum class`는 같은 종류의 이름 있는 값을 모아 새로운 타입을 만듭니다.

```cpp
enum class TaskState {
    Todo,
    Doing,
    Done
};
```

`TaskState`는 타입 이름이고 `Todo`, `Doing`, `Done`은 열거자 이름입니다. 사용할 때는 `TaskState::Doing`처럼 타입의 범위를 함께 적습니다. 여기의 `::`는 타입 범위 안의 이름을 고릅니다. 객체의 멤버를 고르는 점과 역할이 다릅니다.

### 먼저 예측하기

다음 프로그램은 메뉴 번호 1, 2, 3을 받아 각각 Todo, Doing, Done으로 연결합니다. 2를 입력하면 무엇이 출력될까요? 4나 `abc`를 입력하면 상태를 출력할까요?

예제 3 · `examples/03_named_state.cpp`

```cpp
#include <iostream>
#include <string>

enum class TaskState {
    Todo,
    Doing,
    Done
};

std::string stateName(TaskState state) {
    if (state == TaskState::Todo) {
        return "Todo";
    }

    if (state == TaskState::Doing) {
        return "Doing";
    }

    if (state == TaskState::Done) {
        return "Done";
    }

    return "Unknown";
}

int main() {
    int choice = 0;
    TaskState state = TaskState::Todo;

    std::cin >> choice;

    if (!std::cin || choice < 1 || choice > 3) {
        std::cout << "Invalid input\n";
        return 0;
    }

    if (choice == 2) {
        state = TaskState::Doing;
    } else if (choice == 3) {
        state = TaskState::Done;
    }

    std::cout << stateName(state) << '\n';
}
```

입력과 예상 출력:

- 입력 `1`: `Todo`
- 입력 `2`: `Doing`
- 입력 `3`: `Done`
- 입력 `4` 또는 `abc`: `Invalid input`

### 입력 번호와 열거형을 연결하는 이유

`choice`는 사용자가 입력한 정수이고 `state`는 프로그램이 사용하는 상태입니다. 둘을 같은 것으로 취급하지 않습니다. 먼저 입력 성공 여부와 허용 범위를 검사한 뒤, 조건문으로 이름 있는 상태를 선택합니다. 메뉴 1번이 Todo라는 것은 이 프로그램에서 정한 약속입니다.

`!std::cin`은 입력 스트림이 실패 상태인지를 확인하는 식입니다. 정수를 읽지 못했거나 읽을 값 없이 입력이 끝나 추출에 실패했다면 참이 되어 오류 안내로 넘어갑니다.

`stateName`은 상태를 받아 출력할 문자열을 돌려줍니다. `std::cout << state;`로 열거형 값의 이름을 자동 출력할 수는 없습니다. 무엇을 어떤 말로 표시할지 함수에 직접 적습니다. 문자열 반환은 앞 절에서 배운 값 반환과 같습니다.

끝의 `"Unknown"`은 선언한 이름 중 어느 것에도 해당하지 않을 때 사용하는 방어적인 결과입니다. **열거형을 사용한다고 모든 상황에서 이름 있는 값만 존재하는 것은 아닙니다.** 뒤에서 배울 명시적 변환이나 외부 데이터 처리 등으로 이름 없는 값이 들어올 수 있습니다. 여기서는 그 값을 만드는 방법을 다루지 않습니다. 중요한 원칙은 프로그램 밖에서 받은 값을 경계에서 검사하고, 출력 함수의 마지막 경로도 남기는 것입니다. `Unknown`이라는 표시 자체가 잘못된 입력을 올바른 상태로 고쳐 주는 것은 아닙니다.

이 예제는 정수 하나를 추출한 결과를 검사합니다. 입력한 줄 전체가 정확히 숫자 하나로만 되어 있는지를 검사하는 예제는 아닙니다. 예를 들어 `2abc`를 입력하면 정수 2를 읽고 뒤 문자는 남길 수 있습니다. 줄 전체 검사와 재입력은 이 절의 범위에서 제외합니다.

### 타입이 막아 주는 혼동

`enum class`는 정수나 다른 열거형으로 암시적으로 섞이지 않습니다.

- `TaskState state = 1;`은 정수를 상태로 자동 변환할 수 없어 오류입니다.
- `int number = TaskState::Done;`도 상태를 정수로 자동 변환할 수 없어 오류입니다.
- 다른 열거형에 `Done`이 있어도 `ReviewState::Done`은 `TaskState::Done`과 다른 타입의 값입니다.

컴파일 실패를 관찰하는 파일은 정상 예제와 분리했습니다. 각각 하나씩 컴파일하고, 오류 메시지의 정확한 문구보다 거부된 두 타입을 확인하세요.

실패 예제 1 · `examples/fail_01_integer_to_state.cpp`

```cpp
enum class TaskState {
    Todo,
    Doing,
    Done
};

int main() {
    TaskState state = 1; // 의도한 오류: int에서 TaskState로 암시적 변환 불가
}
```

실패 예제 2 · `examples/fail_02_other_enum.cpp`

```cpp
enum class TaskState {
    Todo,
    Doing,
    Done
};

enum class ReviewState {
    Todo,
    Done
};

int main() {
    TaskState state = ReviewState::Done; // 의도한 오류: 서로 다른 열거형
}
```

### 직접 바꾸기

`stateName`의 반환 문자열을 `"대기"`, `"진행 중"`, `"완료"`로 바꾸세요. 입력 번호와 상태 타입은 그대로 두고 표시만 바뀌는지 확인하세요. 상태와 표시 문자열을 구분하면 출력 표현을 바꾸기 쉽습니다.

## 4 작업 하나를 함수에 전달하고 돌려받기

이제 `Task`에 `TaskState state` 멤버를 추가합니다. 상태 타입을 먼저 정의해야 뒤의 `Task` 정의에서 사용할 수 있습니다.

### 먼저 예측하기

다음 예제의 `withState`는 원본을 수정할까요? 두 출력 줄의 상태를 먼저 적어 보세요.

예제 4 · `examples/04_task_functions.cpp`

```cpp
#include <iostream>
#include <string>

enum class TaskState {
    Todo,
    Doing,
    Done
};

struct Task {
    std::string title = "Untitled";
    std::string owner = "Unassigned";
    int plannedMinutes = 0;
    TaskState state = TaskState::Todo;
};

std::string stateName(TaskState state) {
    if (state == TaskState::Todo) {
        return "Todo";
    }

    if (state == TaskState::Doing) {
        return "Doing";
    }

    if (state == TaskState::Done) {
        return "Done";
    }

    return "Unknown";
}

void printTask(const Task& task) {
    std::cout << task.title << " / " << task.owner << " / "
              << task.plannedMinutes << " / " << stateName(task.state) << '\n';
}

Task withState(const Task& task, TaskState state) {
    Task result = task;

    result.state = state;

    return result;
}

int main() {
    Task original{"Review", "Mina", 30, TaskState::Todo};
    Task started = withState(original, TaskState::Doing);

    printTask(original);
    printTask(started);
}
```

예상 출력:

```text
Review / Mina / 30 / Todo
Review / Mina / 30 / Doing
```

`printTask(const Task& task)`는 객체를 복사해서 받지 않고 const 참조로 읽습니다. 함수 안에서 `task.owner`를 바꾸려고 하면 허용되지 않습니다. 사용자 정의 타입이라고 해서 const 참조의 의미가 달라지는 것은 아닙니다.

`withState`는 다음 순서로 동작합니다.

1. 전달받은 원본을 `result`라는 별도 객체로 복사합니다.
2. 복사본의 `state`만 바꿉니다.
3. 변경한 작업을 값으로 반환합니다.

따라서 원본은 Todo이고 반환받은 `started`는 Doing입니다. 반환 결과를 변수에 저장하지 않으면 원본이 저절로 바뀌지는 않습니다. 함수의 이름뿐 아니라 매개변수와 반환 타입, 실제 대입 대상을 함께 읽으세요.

### 타입과 업무 규칙은 다르다

현재 `Task`는 음수 예상 시간이나 빈 제목을 자동으로 금지하지 않습니다. `withState`도 상태 변경 순서를 검사하지 않으므로 Todo에서 Done으로 바로 바꾸는 호출을 허용합니다. `enum class`는 상태의 종류를 구분할 뿐, 편집팀의 업무 규칙을 모두 구현하지는 않습니다.

업무에서 예상 시간이 0 이상이어야 한다면 입력을 받을 때 검사해야 합니다. 상태 변경에 조건이 있다면 해당 함수에 조건을 작성해야 합니다. 이번 절에서는 누구나 각 멤버에 직접 대입할 수 있는 단순한 구조체를 사용합니다. 내부 규칙을 더 강하게 유지하는 설계는 뒤에서 다룹니다.

### 직접 바꾸기

`Task finished = withState(started, TaskState::Done);`를 추가하고 세 객체를 출력하세요. 각각 Todo, Doing, Done이 나와야 합니다. 상태가 바뀌었다고 `plannedMinutes`가 0이 되는 것은 아닙니다. 이 값은 실제 남은 시간이 아니라 작업에 처음 잡은 예상 시간입니다.

## 5 여러 작업을 모아 요약하기

`vector<int>`에 정수를 담았던 것처럼 `vector<Task>`에는 작업을 담을 수 있습니다. 여기서는 `vector` 사용법을 확장할 뿐, `vector` 자체를 만드는 문법은 배우지 않습니다.

### 먼저 예측하기

아래 목록에는 완료한 작업 하나와 미완료 작업 둘이 있습니다. 미완료 작업에 배정된 예상 시간은 얼마일까요? 목록이 비어 있으면 결과는 어떻게 되어야 할까요?

예제 5 · `examples/05_task_summary.cpp`

```cpp
#include <iostream>
#include <string>
#include <vector>

enum class TaskState {
    Todo,
    Doing,
    Done
};

struct Task {
    std::string title = "Untitled";
    std::string owner = "Unassigned";
    int plannedMinutes = 0;
    TaskState state = TaskState::Todo;
};

struct TaskSummary {
    int doneCount = 0;
    int unfinishedMinutes = 0;
};

TaskSummary summarize(const std::vector<Task>& tasks) {
    TaskSummary result{};

    for (const auto& task : tasks) {
        if (task.state == TaskState::Done) {
            ++result.doneCount;
        } else {
            result.unfinishedMinutes += task.plannedMinutes;
        }
    }

    return result;
}

void printSummary(const TaskSummary& summary) {
    std::cout << "Done: " << summary.doneCount << '\n';
    std::cout << "Unfinished planned minutes: "
              << summary.unfinishedMinutes << '\n';
}

int main() {
    std::vector<Task> tasks{
        {"Outline", "Mina", 20, TaskState::Done},
        {"Review", "Joon", 30, TaskState::Doing},
        {"Publish", "Mina", 10, TaskState::Todo}
    };
    std::vector<Task> emptyTasks{};
    TaskSummary summary = summarize(tasks);
    TaskSummary emptySummary = summarize(emptyTasks);

    printSummary(summary);
    printSummary(emptySummary);
}
```

예상 출력:

```text
Done: 1
Unfinished planned minutes: 40
Done: 0
Unfinished planned minutes: 0
```

바깥 중괄호는 벡터의 원소 목록이고 안쪽 중괄호 하나가 작업 하나입니다. 각 작업 안의 값은 여전히 `Task` 멤버 선언 순서에 맞춰야 합니다.

`const std::vector<Task>& tasks`는 벡터 전체를 읽기 전용 참조로 받습니다. 반복문의 `const auto& task`는 현재 원소 하나를 읽기 전용 참조로 사용합니다. `task.state`로 상태를 검사하고 `task.plannedMinutes`로 그 작업의 시간을 더합니다.

함수는 두 결과를 `TaskSummary`로 묶어 반환합니다. 완료 개수와 시간 합계를 서로 관계없는 변수로 흩어 반환하려고 할 필요가 없습니다. 결과에도 새 타입을 쓸 수 있습니다.

`TaskSummary result{};`의 두 멤버는 0으로 시작합니다. 빈 벡터에서는 반복문 본문을 한 번도 실행하지 않고 이 결과를 그대로 반환합니다. 첫 원소를 읽는 코드나 나눗셈이 없으므로 빈 목록을 별도로 처리하지 않아도 두 값이 0이 됩니다.

이 집계는 상태가 Todo, Doing, Done 중 하나이고 예상 시간이 0 이상인 정상 작업 목록을 전제로 합니다. `else`는 이름 없는 상태까지 미완료로 처리할 수 있으므로 외부 데이터의 유효성을 검사하는 함수는 아닙니다. 입력 검사를 통과한 작업만 목록에 넣는 책임과, 이미 유효한 목록을 집계하는 책임을 구분하세요. 예제처럼 작은 목록의 합계만 다루며 정수 범위를 넘는 대규모 누적은 별도 고려가 필요합니다.

### 직접 바꾸기

마지막 작업의 상태를 Done으로 바꾸세요. 완료 개수는 2, 미완료 예상 시간은 30이 됩니다. 이어서 목록의 모든 원소를 지워 빈 벡터로 실행하세요. 예측한 0과 0이 유지되는지 확인하세요.

## 6 연습문제

아래 문제는 앞 예제의 타입 정의를 사용합니다. 코드 조각은 해당 예제에 넣어 실행하며, 모든 조각을 한 파일에 합쳐 같은 타입이나 함수를 중복 정의하지 마세요.

### 문제 1 멤버 선언 순서 읽기

예제 2의 `Task` 정의로 다음 객체를 만듭니다. `task.title`, `task.owner`, `task.plannedMinutes`의 값을 쓰세요. 제목을 Outline, 담당자를 Joon으로 만들려면 어떻게 고쳐야 할까요?

```cpp
Task task{"Joon", "Outline"};
```

### 문제 2 복사와 참조 구별하기

예제 4의 `Task` 정의를 사용합니다. 다음 코드 이후 `original.owner`, `copy.owner`, `view.owner`의 값을 예측하고 이유를 설명하세요.

```cpp
Task original{"Review", "Mina", 30, TaskState::Todo};
Task copy = original;
const Task& view = original;

copy.owner = "Joon";
original.owner = "Ara";
```

### 문제 3 열거형 오류 고치기

`TaskState state = 2;`를 보고 “2번 메뉴니까 Doing이겠지”라고 생각했습니다. 왜 컴파일되지 않을까요? 사용자 입력이 없는 상황에서 Doing 상태를 초기화하는 한 줄을 쓰세요. `std::cout << state;` 대신 상태 이름을 출력하는 한 줄도 쓰세요.

### 문제 4 새 담당자를 가진 복사본 반환하기

예제 4에 `Task withOwner(const Task& task, const std::string& owner)` 함수를 추가하세요. 원본은 바꾸지 않고 담당자만 바꾼 작업을 반환해야 합니다. 원본 담당자가 Mina일 때 Joon을 지정하여 두 객체를 출력하고 차이를 확인하세요.

### 문제 5 입력 경계 검사하기

예상 시간 하나를 정수로 입력받고, 입력 실패 또는 음수이면 `Invalid minutes`를 출력한 뒤 종료하는 코드를 작성하세요. 유효할 때만 예제 4의 `Task` 객체를 만들고 `printTask`로 출력하세요. 제목은 Review, 담당자는 Mina, 상태는 Todo로 합니다. 0은 허용합니다. 입력 `-1`, `abc`, `0`, `25`에 대해 결과를 설명하세요.

### 문제 6 담당자별 미완료 예상 시간 구하기

예제 5에 `int unfinishedMinutesFor(const std::vector<Task>& tasks, const std::string& owner)`를 작성하세요. 지정한 담당자의 작업 중 Done이 아닌 작업의 예상 시간만 더합니다. 예제 5 목록에서 Mina는 10, Joon은 30, 없는 담당자 Ara는 0이어야 합니다. 빈 목록도 0이어야 합니다. 정상적인 상태와 0 이상의 시간을 가진 입력을 전제로 하며, 누적 합은 `int`가 표현할 수 있는 범위 안이어야 합니다.

## 7 연습문제 해설

### 해설 1 같은 타입이면 순서 실수를 잡지 못할 수 있다

제목은 Joon, 담당자는 Outline, 시간은 15입니다. 첫 두 값은 선언 순서대로 들어가고, 생략된 시간은 예제 2의 멤버 기본값 15를 사용합니다. 다음처럼 문자열 순서를 고칩니다.

```cpp
Task task{"Outline", "Joon"};
```

문법상 올바른 코드와 업무상 의도한 코드가 항상 같지는 않습니다. 같은 타입의 멤버가 연달아 있을수록 초기화 순서를 더 주의해서 읽으세요.

### 해설 2 복사본은 독립적이고 참조는 원본을 가리킨다

차례대로 Ara, Joon, Ara입니다. `copy`는 별도의 객체이므로 그 담당자를 바꿔도 원본은 바뀌지 않습니다. `view`는 원본에 대한 참조이므로 원본이 Ara로 바뀐 뒤 읽으면 Ara가 나옵니다. `const`는 `view`를 통해 값을 변경하지 못하게 할 뿐, 원본이 다른 경로로 바뀌는 것까지 막지는 않습니다.

### 해설 3 메뉴 번호와 타입 값을 구분한다

정수는 `TaskState`로 암시적으로 변환되지 않습니다. 메뉴 번호 2가 Doing이라는 연결은 예제 3의 조건문에 작성한 규칙이며, 열거형 선언 자체가 입력 메뉴를 이해하는 것은 아닙니다.

```cpp
TaskState state = TaskState::Doing;

std::cout << stateName(state) << '\n';
```

이름 있는 값으로 초기화하면 의도가 드러납니다. 출력은 `stateName`이 돌려준 문자열을 사용합니다.

### 해설 4 원본을 복사한 뒤 복사본만 변경한다

```cpp
Task withOwner(const Task& task, const std::string& owner) {
    Task result = task;

    result.owner = owner;

    return result;
}
```

호출 예:

```cpp
Task original{"Review", "Mina", 30, TaskState::Todo};
Task reassigned = withOwner(original, "Joon");

printTask(original);
printTask(reassigned);
```

출력은 `Review / Mina / 30 / Todo`, `Review / Joon / 30 / Todo`입니다. `task`가 const 참조이므로 원본을 직접 고치지 않고, `result`를 만들어 수정합니다. 제목·시간·상태는 복사한 값을 유지합니다. 함수 호출만 하고 반환값을 버리면 원본 담당자는 바뀌지 않습니다.

### 해설 5 유효한 입력을 확인한 뒤 객체를 만든다

다음은 예제 4의 타입과 함수 정의를 그대로 두고 바꾼 `main`입니다.

```cpp
int main() {
    int minutes = 0;

    std::cin >> minutes;

    if (!std::cin || minutes < 0) {
        std::cout << "Invalid minutes\n";
        return 0;
    }

    Task task{"Review", "Mina", minutes, TaskState::Todo};

    printTask(task);
}
```

`-1`은 음수이므로, `abc`는 정수 추출에 실패하므로 `Invalid minutes`를 출력합니다. `0`은 허용 범위에 있으므로 `Review / Mina / 0 / Todo`, `25`는 `Review / Mina / 25 / Todo`를 출력합니다. 검사를 객체 생성 앞에 둔 것은 이 경로에서 잘못된 시간의 작업을 만들지 않기 위해서입니다. 다른 코드가 나중에 멤버에 음수를 대입하는 것까지 막지는 못합니다.

### 해설 6 조건을 만족하는 원소만 누적한다

```cpp
int unfinishedMinutesFor(const std::vector<Task>& tasks,
                         const std::string& owner) {
    int total = 0;

    for (const auto& task : tasks) {
        if (task.owner == owner && task.state != TaskState::Done) {
            total += task.plannedMinutes;
        }
    }

    return total;
}
```

담당자 일치와 미완료라는 두 조건을 모두 만족해야 시간을 더합니다. Mina의 Outline은 완료 상태여서 제외되고 Publish의 10분만 더합니다. Joon의 Review는 미완료여서 30분입니다. Ara는 일치하는 원소가 없어 0이고, 빈 목록은 반복문이 실행되지 않아 초기값 0을 반환합니다. 조건에 맞는 원소가 하나도 없을 때 자연스럽게 나올 값을 먼저 정하면 별도 예외 처리를 줄일 수 있습니다.

## 핵심 정리

- `struct`는 관련된 값을 가진 타입을 정의합니다. 정의 끝의 세미콜론과 객체 생성 구문을 구별합니다.
- 객체의 멤버는 점으로 접근합니다. 각 객체는 자기 멤버 값을 가집니다.
- 이 절의 단순한 구조체를 중괄호로 초기화할 때 값은 멤버 선언 순서에 대응합니다. 생략한 멤버에는 먼저 멤버 기본값이 적용됩니다.
- 문자열·정수·열거형으로 구성한 작업을 복사하면 독립적인 값을 가진 새 객체를 사용할 수 있습니다. 참조는 복사와 다릅니다.
- `enum class`의 값은 `TaskState::Done`처럼 씁니다. 정수나 다른 열거형과 암시적으로 섞이지 않으며, 이름 출력은 별도 함수로 정의합니다.
- 사용자 정의 타입에도 const 참조 매개변수와 값 반환을 적용할 수 있습니다. 여러 결과를 구조체 하나에 묶어 반환할 수도 있습니다.
- `vector<Task>`를 순회해 집계할 수 있습니다. 빈 목록의 결과와 입력의 유효성 책임을 함께 생각합니다.
- 타입은 표현을 분명히 하지만 모든 업무 규칙을 자동 보장하지는 않습니다. 외부 입력은 경계에서 검사해야 합니다.

다음 단계에서는 데이터를 묶는 것에서 더 나아가, 객체의 사용 방법과 유지해야 할 규칙을 어떻게 함께 표현할지 살펴봅니다.

## 기술 참고 자료

아래 자료는 C++20 작업 초안 N4861의 조항을 제공하는 공개 HTML 자료입니다. 본문은 입문 범위에 맞게 설명했으며, 아래의 더 넓은 규칙 전체를 이번 절에서 익힐 필요는 없습니다.

- [집계 초기화와 생략한 멤버의 초기화 — dcl.init.aggr](https://timsong-cpp.github.io/cppwp/n4861/dcl.init.aggr): 선언 순서에 따른 초기화와 멤버 기본 초기화의 적용 근거입니다.
- [열거형 선언과 범위 있는 열거형 — dcl.enum](https://timsong-cpp.github.io/cppwp/n4861/dcl.enum): 열거형의 타입 구분, 이름의 범위, 이름 없는 값에 대한 규칙입니다.
- [목록 초기화 — dcl.init.list 문단 3.8](https://timsong-cpp.github.io/cppwp/n4861/dcl.init.list#3.8): 일부 정수 직접 목록 초기화가 허용되는 규칙입니다. 본문에서 정수와의 ‘암시적 변환 금지’를 모든 초기화 방식의 금지로 일반화하지 않는 이유입니다.
- [멤버별 복사 — class.copy.ctor 문단 14](https://timsong-cpp.github.io/cppwp/n4861/class.copy.ctor#14): 이 절의 단순한 구조체를 복사할 때 멤버별로 초기화하는 근거입니다.
- [값 반환 — stmt.return 문단 2](https://timsong-cpp.github.io/cppwp/n4861/stmt.return#2): 반환 결과의 초기화 규칙입니다. 값을 반환한다는 설명이 실행 중 추가 복사가 반드시 일어난다는 뜻은 아닙니다.
