이름, 인사말, 검색어, 메모에는 공통점이 있습니다. 숫자 하나로 표현하기보다 여러 문자를 순서대로 묶어 다루는 편이 자연스럽다는 점입니다. C++에서는 `std::string`으로 이런 문자열을 저장할 수 있습니다. 이번 시간에는 문자열을 선언하는 데서 한 걸음 더 나아가, 내용을 확인하고 조합하고 입력받는 작은 프로그램을 만듭니다.

학습 목표는 세 가지입니다.

- `length()`, `empty()`, 연결 연산자와 `find()`로 문자열의 길이·연결·검색 결과를 예측한다
- 단어 입력과 `getline()`의 한 줄 입력을 구별하고, 입력 실패와 남은 줄바꿈을 처리한다
- `char`와 `std::string`을 구별하고, 문자열의 요소 수가 사람이 보는 글자 수와 다를 수 있음을 설명한다

필요한 선행 지식은 변수, 대입, `std::cout`, `std::cin`, 그리고 `if`입니다. 새로운 표현은 나오는 자리에서 설명합니다. 코드를 보자마자 실행하기보다 먼저 출력 한두 줄을 예상해 보세요. 예상이 달랐다면 어떤 줄에서 생각이 갈렸는지 찾아보는 것이 이번 수업의 핵심입니다.

## 시작 준비: 예제 하나를 프로젝트 하나로

학습 환경은 Visual Studio의 C++ 콘솔 앱과 MSVC, C++20입니다. 프로젝트 속성의 **C/C++ → 언어 → C++ 언어 표준**에서 `/std:c++20`을 선택하고, **C/C++ → 명령줄 → 추가 옵션**에 `/utf-8`을 넣습니다. 소스 파일 자체도 UTF-8로 저장하세요. 설정을 바꿀 때는 현재 실행하는 구성과 플랫폼에 적용되어 있는지 확인합니다.

각 예제에는 `main()`이 하나씩 있습니다. 예제 파일을 한 프로젝트에 전부 추가하지 말고, 예제 하나마다 별도 프로젝트를 만들거나 현재 프로젝트의 소스를 실행할 예제 하나로 바꾸세요. 여러 `main()`을 함께 빌드해서 생기는 문제는 문자열 문법의 문제가 아닙니다.

이 글의 전체 프로그램은 함께 제공되는 예제 파일과 동일합니다. 중간의 짧은 코드는 별도로 **코드 조각**이라고 표시합니다. 코드 조각은 필요한 헤더와 `main()` 안에 넣어 실행해야 합니다. 예상 출력은 프로그램의 동작을 이해하기 위한 설명이며, 이 자료를 Visual Studio에서 실제 실행했다는 기록은 아닙니다.

`/utf-8`은 소스와 실행 문자 집합을 지정하는 컴파일 옵션입니다. 이 옵션만으로 터미널의 입출력 인코딩이나 글꼴까지 바뀌지는 않습니다. 우선 영문 이름으로 입력을 연습하고, 마지막 절에서 한글과 UTF-8의 관계를 살펴봅시다.

## 1. 문자열의 길이와 비어 있음

### 실행 전에 예상하기

`"C++"`에는 `C`, `+`, `+`가 들어 있습니다. 길이를 재면 얼마일까요? 아무 내용도 넣지 않은 문자열과 공백 한 칸을 넣은 문자열은 둘 다 화면에서 잘 보이지 않습니다. 그렇다면 둘 다 비어 있는 문자열일까요?

### 예제 01 · `01_length_empty.cpp`

```cpp
#include <iostream>
#include <string>

int main() {
    std::string title = "C++";
    std::string blank;
    std::cout << "title length=" << title.length() << '\n';
    std::cout << std::boolalpha;
    std::cout << "blank empty=" << blank.empty() << '\n';
    blank = " "; // One space is still a character.
    std::cout << "space empty=" << blank.empty() << '\n';
}
```

예상 출력:

```text
title length=3
blank empty=true
space empty=false
```

### 결과를 읽는 법

`#include <string>`은 `std::string`을 사용하기 위한 헤더입니다. `std::string title = "C++";`은 문자열 변수를 만들면서 초기 내용을 넣습니다. 반면 `std::string blank;`는 내용을 지정하지 않았으므로 빈 문자열을 만듭니다. 숫자형 지역 변수를 초기화하지 않은 경우와 달리, 이 문자열의 처음 상태는 분명히 비어 있습니다.

`title.length()`에서 점은 `title`이라는 문자열에 속한 기능을 사용한다는 표시입니다. 괄호가 붙은 `length()`는 현재 저장된 `char` 단위의 개수를 돌려줍니다. 지금 사용한 영문과 기호에서는 눈으로 세는 개수와 같아서 3입니다. `title.size()`라고 써도 같은 값을 얻습니다. `size()`와 `length()`는 이 문자열의 길이에 관해서 동일한 기능입니다. 문자열의 끝을 표시하는 종단 널 문자는 이 길이에 포함하지 않습니다. 따라서 `"C++"`로 만든 문자열의 길이에 끝 표시용 1을 더하지 않습니다.

`empty()`는 길이를 숫자로 알려 주는 대신, 비어 있는지를 `true` 또는 `false`로 알려 줍니다. 아무것도 없을 때 `true`, 무엇이든 들어 있을 때 `false`입니다. `std::boolalpha`는 이후 불리언 값을 출력할 때 `1`, `0` 대신 `true`, `false`로 표시하게 합니다. 문자열의 상태를 바꾸는 명령은 아닙니다.

공백은 눈에 잘 보이지 않아도 실제 내용입니다. `blank = " ";`를 실행하면 공백 한 칸이 저장되므로 길이는 1이고 `empty()`는 `false`입니다. 빈 문자열 `""`의 길이는 0입니다. 문장에 포함된 공백도 길이에 포함된다는 점을 함께 기억하세요.

프로그램이 이름을 입력받았을 때 `empty()`만 검사하면 공백만 입력한 이름은 통과할 수 있습니다. 이 기능은 “의미 있는 이름인가?”를 판단하지 않습니다. 정확히 “저장된 단위가 하나도 없는가?”를 판단합니다. 함수 이름을 읽을 때 사람의 판단을 덧붙이지 않는 습관이 중요합니다.

### 바꿔 보고 확인하기

`title`을 `"C++ 20"`으로 바꾸고 길이를 먼저 적어 보세요. 가운데 공백까지 세면 6입니다. 다음으로 `blank = " ";`를 `blank = "";`로 바꾸세요. 마지막 출력이 `true`로 바뀌는 이유를 길이와 연결해 설명할 수 있으면 이 절을 이해한 것입니다.

## 2. 문자열을 이어 붙이는 두 가지 방법

### 실행 전에 예상하기

`"Hello, "`와 `"Mina"`를 이어 붙이면 인사말을 만들 수 있습니다. 이때 쉼표 뒤의 공백은 자동으로 생길까요? 마지막에 느낌표 하나만 덧붙이려면 문자열 전체를 다시 적어야 할까요?

### 예제 02 · `02_concatenation.cpp`

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name = "Mina";
    std::string greeting = "Hello, " + name;
    greeting += '!';
    std::cout << greeting << '\n';
    std::string empty;
    std::cout << "empty + name=" << empty + name << '\n';
    // Two string literals cannot be added with +. Start with std::string.
    std::cout << std::string("C") + "++" << '\n';
}
```

예상 출력:

```text
Hello, Mina!
empty + name=Mina
C++
```

### 결과를 읽는 법

`+`는 여기서 두 내용을 순서대로 이어 붙인 결과를 만듭니다. `"Hello, " + name`은 왼쪽 인사말 뒤에 `name`의 내용을 붙입니다. 공백은 `"Hello, "`의 마지막에 직접 넣어 두었습니다. 프로그램이 영어 문장이라는 이유로 띄어쓰기를 보충하지는 않습니다. 공백을 지우면 `Hello,Mina`가 됩니다.

`std::string greeting = ...;`은 이렇게 만들어진 결과를 `greeting`에 저장합니다. 이 과정에서 `name`은 여전히 `"Mina"`입니다. `+`로 조합한 결과와 조합에 사용한 원래 문자열을 구분하세요. 식을 계산했다는 사실만으로 기존 변수의 내용이 바뀌지는 않습니다.

`greeting += '!';`은 기존 `greeting`의 뒤에 느낌표를 덧붙입니다. `+`가 결과를 만드는 표현이라면 `+=`는 왼쪽 변수에 그 결과를 반영하는 표현입니다. 따라서 이 줄 다음에는 `greeting`이 `"Hello, Mina!"`가 됩니다. 느낌표에 작은따옴표가 쓰인 까닭은 뒤의 `char` 절에서 자세히 설명합니다. 여기서는 문자 하나도 문자열 뒤에 붙일 수 있다는 점만 확인하세요.

빈 문자열을 이어 붙이면 새로운 내용은 늘어나지 않습니다. `empty + name`의 결과는 `"Mina"`입니다. 빈 문자열은 문자열 작업의 정상적인 출발점이며, 그 자체가 오류는 아닙니다. 내용을 조금씩 모아 하나의 결과를 만드는 프로그램에서도 이런 출발점을 자주 사용합니다.

주의할 점은 큰따옴표로 적은 표현 두 개에 언제나 `+`를 사용할 수 있는 것은 아니라는 사실입니다. `"C" + "++"`는 이 수업에서 원하는 문자열 덧셈으로 처리되지 않으며 컴파일 오류입니다. 문자열 리터럴과 `std::string`은 관련은 있지만 같은 종류의 값은 아닙니다. 예제처럼 `std::string("C") + "++"`로 한쪽을 문자열 객체로 만들면 의도가 분명해집니다. 첫 줄의 `"Hello, " + name`은 `name`이 이미 `std::string`이므로 가능합니다.

### 바꿔 보고 확인하기

`name`을 `"Mina Kim"`으로 바꾸어 보세요. 이름 속 공백은 그대로 유지됩니다. 이어서 `greeting += '!';`를 한 번 더 적으면 어떤 결과가 될까요? 같은 변수에 계속 덧붙이므로 느낌표가 두 개가 됩니다. 반대로 `greeting = "!";`로 바꾸면 인사말이 없어지고 느낌표만 남습니다. `=`과 `+=`의 차이를 출력으로 확인해 보세요.

## 3. 원하는 내용의 위치 찾기

### 실행 전에 예상하기

`"banana"` 안에서 `"ana"`는 두 번 보입니다. `find()`는 어느 위치를 돌려줄까요? 맨 앞에서 찾은 경우와 아예 못 찾은 경우를 모두 0으로 표시하면 구별할 수 있을까요?

### 예제 03 · `03_find_npos.cpp`

```cpp
#include <iostream>
#include <string>

int main() {
    std::string text = "banana";
    // auto keeps the correct unsigned position type without a conversion.
    auto position = text.find("ana");
    if (position != std::string::npos) {
        std::cout << "ana at=" << position << '\n';
    }
    if (text.find("pear") == std::string::npos) {
        std::cout << "pear not found\n";
    }
    if (text.find("ban") == 0) {
        std::cout << "ban starts at zero\n";
    }
    // Never use if (text.find(...)): zero is a successful match!
}
```

예상 출력:

```text
ana at=1
pear not found
ban starts at zero
```

### 위치는 0부터 센다

문자열의 위치는 첫 번째를 0으로 셉니다. `banana`에서 `b`는 0, 그다음 `a`는 1, `n`은 2입니다. 계속 세면 마지막 `a`는 5입니다. 길이는 전체 개수이므로 6이고, 마지막 글자의 위치는 5라는 점을 구분하세요. 개수와 위치는 서로 다른 질문에 대한 답입니다.

`text.find("ana")`는 앞에서부터 일치하는 내용을 찾고, 처음 일치한 부분의 시작 위치를 돌려줍니다. 따라서 결과는 1입니다. 뒤쪽에도 일치하는 부분이 있지만 한 번의 호출이 모든 위치를 알려 주지는 않습니다. 검색어의 길이인 3을 돌려주는 것도 아닙니다.

`auto position = ...;`의 `auto`는 오른쪽 결과에 맞게 변수의 자료형을 컴파일러가 정하도록 합니다. `find()`의 결과는 문자열의 위치를 나타내는 전용 정수형인 `std::string::size_type`입니다. 이 수업에서는 긴 자료형 이름을 직접 쓰는 대신 `auto`로 정확한 형을 유지합니다. `auto`는 어떤 자료형도 마음대로 담는 상자라는 뜻이 아닙니다. 이 선언에서 자료형이 정해집니다.

### 못 찾았다는 표시는 `npos`

검색에 실패하면 `find()`는 `std::string::npos`를 돌려줍니다. 이것은 “유효한 위치가 없다”는 뜻으로 비교할 특별한 값입니다. `position != std::string::npos`이면 찾은 것이고, `position == std::string::npos`이면 못 찾은 것입니다. 예제는 두 방향의 비교를 모두 보여 줍니다.

`npos`의 실제 숫자를 외우거나 출력해서 실패 여부를 판단할 필요는 없습니다. 또한 결과를 `int`에 담고 `-1`과 비교하는 습관은 피하세요. 위치 자료형은 부호 없는 정수형이며, 다른 형으로 옮기는 과정에서 원래 의미를 잃을 수 있습니다. 결과는 `auto`로 받고 실패는 `std::string::npos`와 비교하면 됩니다.

특히 `if (text.find("ban"))`처럼 검색 결과를 바로 조건에 넣으면 안 됩니다. 조건식에서 0은 거짓으로 취급되지만, 여기서 0은 맨 앞에서 성공적으로 찾았다는 뜻입니다. 반대로 못 찾았을 때의 `npos`는 0이 아닙니다. 이런 코드는 성공과 실패를 거꾸로 판단할 위험이 있습니다.

예제 마지막 조건 `text.find("ban") == 0`은 “맨 앞에서 시작하는가?”라는 구체적인 질문입니다. 아무 위치에서든 찾았는지를 물으려면 `!= std::string::npos`를 사용해야 합니다. 자신이 묻는 것이 포함 여부인지, 시작 위치인지 먼저 문장으로 적으면 조건식을 고르기 쉽습니다.

### 바꿔 보고 확인하기

검색어 `"ana"`를 `"banana"`로 바꾸면 결과는 0입니다. 전체 문자열과 일치해도 시작 위치는 첫 자리입니다. 다음으로 `"Ban"`을 찾아보세요. 대문자 `B`와 소문자 `b`는 다르게 비교하므로 못 찾습니다. `find()`는 사람처럼 비슷한 철자를 추측하는 검색 기능이 아닙니다.

<figure class="concept-figure">
<a href="/cpp-jeongseok/assets/illustrations/02-2-string-workbench.webp"><img src="/cpp-jeongseok/assets/illustrations/02-2-string-workbench.webp" width="1200" height="800" loading="lazy" decoding="async" alt="두 짧은 파란 띠와 하나의 긴 띠, 긴 띠의 일부를 살펴보는 청록색 돋보기"></a>
<figcaption>AI로 생성한 개념 일러스트입니다. 두 문자열을 잇고 문자열 안에서 일부를 찾는 작업을 비유합니다. 실제 메모리 배치나 문자 개수를 나타내는 도표는 아닙니다.</figcaption>
</figure>

그림 설명: 두 짧은 파란 띠와 하나의 긴 띠, 긴 띠의 일부를 살펴보는 청록색 돋보기

## 4. 선택 실험: 시작 위치와 빈 검색어

이 절은 검색의 경계를 확인하는 추가 실험입니다. 처음 읽을 때는 출력과 이유만 확인하고 다음 절로 넘어가도 됩니다. 핵심 규칙은 “검색 시작 위치를 지정할 수 있다”와 “빈 문자열도 검색어가 될 수 있다”입니다.

### 실행 전에 예상하기

`"aba"`에서 1번 위치부터 `a`를 찾으면 앞의 `a`를 다시 찾을까요? 문자열 끝에서 아무 내용도 없는 검색어 `""`를 찾으면 실패할까요?

### 예제 04 · `04_find_boundaries.cpp`

```cpp
#include <iostream>
#include <string>

int main() {
    std::string text = "aba";
    std::cout << "a from 1=" << text.find('a', 1) << '\n';
    std::cout << "empty at end=" << text.find("", text.length()) << '\n';
    std::cout << std::boolalpha;
    std::cout << "a at end missing="
              << (text.find('a', text.length()) == std::string::npos) << '\n';
    std::cout << "past end missing="
              << (text.find("", text.length() + 1) == std::string::npos) << '\n';
    std::string empty;
    std::cout << "empty in empty=" << empty.find("") << '\n';
    std::cout << "a in empty missing="
              << (empty.find('a') == std::string::npos) << '\n';
}
```

예상 출력:

```text
a from 1=2
empty at end=3
a at end missing=true
past end missing=true
empty in empty=0
a in empty missing=true
```

### 결과를 읽는 법

`find('a', 1)`의 두 번째 값은 검색을 시작할 위치입니다. 1번 위치부터 뒤를 살피므로 0번의 `a`는 대상에서 빠지고, 2번의 `a`를 찾습니다. 반환값 2는 검색 시작점으로부터 이동한 칸 수가 아니라 원래 문자열에서의 위치입니다.

길이가 3이면 실제 글자의 위치는 0, 1, 2입니다. 위치 3은 마지막 글자 다음의 경계입니다. 그곳에는 `a`가 없으므로 `find('a', text.length())`는 실패합니다. 하지만 빈 검색어는 글자를 하나도 소비하지 않고도 일치할 수 있어서, 끝 경계인 3에서도 찾을 수 있습니다. 시작 위치가 길이보다 큰 4이면 빈 검색어라도 실패합니다.

빈 문자열 안에서 빈 검색어를 찾으면 0을 얻습니다. 빈 문자열의 시작과 끝은 같은 경계이기 때문입니다. 반면 빈 문자열에 `a`가 들어 있을 수는 없으므로 그 검색은 실패합니다. 이 결과는 `empty()`와도 충돌하지 않습니다. `empty()`는 저장된 내용이 있는지 묻고, `find("")`는 길이 0인 검색어가 일치할 위치를 묻습니다.

### 바꿔 보고 확인하기

첫 검색의 시작 위치를 0, 2, 3으로 각각 바꾸세요. 결과는 차례로 0, 2, 실패입니다. 실패일 때는 숫자를 직접 읽으려 하지 말고 `npos`와 비교해 문장으로 출력하세요. 검색 시작 위치를 바꾸어도 문자열 자체의 내용이나 길이는 바뀌지 않습니다.

## 5. `char` 하나와 `std::string` 하나는 다르다

### 실행 전에 예상하기

작은따옴표의 `'A'`와 큰따옴표의 `"A"`는 화면에 출력하면 비슷하게 보입니다. 그렇다면 변수 선언에서도 자유롭게 바꿔 쓸 수 있을까요? 아무것도 담지 않은 문자 하나를 `''`로 표현할 수 있을까요?

### 예제 05 · `05_char_and_string.cpp`

```cpp
#include <iostream>
#include <string>

int main() {
    char letter = 'A'; // Single quotes: one char.
    std::string word = "A"; // Double quotes: a string literal initializes string.
    std::string repeated(3, letter);
    word += '!';
    std::cout << "letter=" << letter << '\n';
    std::cout << "word=" << word << '\n';
    std::cout << "repeated=" << repeated << '\n';
    std::string empty = ""; // There is no empty char literal.
    std::cout << "empty length=" << empty.length() << '\n';
}
```

예상 출력:

```text
letter=A
word=A!
repeated=AAA
empty length=0
```

### 결과를 읽는 법

`char letter = 'A';`는 문자 단위 하나를 저장하는 변수를 만듭니다. 작은따옴표는 이 예제처럼 문자 리터럴을 표현할 때 사용합니다. `std::string word = "A";`는 문자열 리터럴로 문자열 변수를 초기화합니다. 지금 길이가 1이라는 사실만으로 문자열 변수가 `char` 변수로 바뀌지는 않습니다.

`word += '!';`은 문자열에 문자 하나를 붙입니다. 결과는 길이가 2인 `"A!"`입니다. `letter`는 그대로 `'A'`입니다. 문자와 문자열은 서로 완전히 무관한 것이 아니라, 문자열 작업에서 문자 하나를 재료로 사용할 수 있는 관계입니다. 하지만 두 자료형을 같은 것으로 취급해서는 안 됩니다.

`std::string repeated(3, letter);`은 새로 나오는 생성 방식입니다. 괄호 안의 첫 값은 반복 횟수이고 두 번째 값은 반복할 문자입니다. 따라서 `'A'` 세 개로 이루어진 `"AAA"`가 만들어집니다. `std::string repeated = 'A';`라고 쓰는 것과 같지 않습니다. 문자 하나로 문자열을 만들고 싶다면 이 방식에서 횟수를 1로 지정할 수 있습니다.

빈 문자열은 `""`로 나타낼 수 있습니다. 반면 `''`는 유효한 빈 문자 리터럴이 아닙니다. `char` 변수는 문자 단위 하나를 담는 변수이고, 길이가 0인 문자열과는 성격이 다릅니다. 따옴표 모양을 단순한 스타일 취향으로 고르지 마세요. 무엇을 표현하는지에 따라 선택합니다.

이번 절의 “문자 하나”는 우선 `A`, `!` 같은 기본 문자로 이해하면 됩니다. 한글 음절이나 이모지가 화면에서 하나처럼 보인다고 해서 언제나 `char` 하나에 담기는 것은 아닙니다. 이 점 때문에 마지막 절에서 저장 단위와 화면의 글자를 구분합니다.

### 바꿔 보고 확인하기

반복 횟수 3을 0으로 바꾸면 `repeated`는 빈 문자열이 됩니다. 횟수를 5로 바꾸면 `AAAAA`가 됩니다. 다음으로 `letter`를 `'*'`로 바꾸세요. 반복 문자열만 달라지는지, `word`까지 달라지는지 확인해 보세요. 두 변수는 각각 따로 초기화되어 있습니다.

## 6. 공백까지 포함해 한 줄 입력받기

### 실행 전에 예상하기

이름으로 `Mina Kim`을 입력했는데 `Mina`만 저장되었다면 어떤 일이 일어난 걸까요? 문자열에 대한 `std::cin >> name`은 보통 앞의 공백을 건너뛰고 다음 공백 전까지 읽습니다. 이름 전체나 짧은 메모처럼 한 줄이 필요한 상황에서는 `std::getline()`을 사용합니다.

### 예제 06 · `06_getline.cpp`

```cpp
#include <iostream>
#include <string>

int main() {
    std::string line;
    // No prompt keeps redirected test input/output deterministic.
    if (!std::getline(std::cin, line)) {
        std::cout << "no line\n";
        return 0;
    }
    std::cout << "line=[" << line << "]\n";
    std::cout << "length=" << line.length() << '\n';
    // An empty line succeeds; EOF before any character is a failed read.
}
```

입력 예:

```text
Mina Kim
```

예상 출력:

```text
line=[Mina Kim]
length=8
```

### 무엇을 읽고, 무엇을 남기지 않는가

`std::getline(std::cin, line)`은 표준 입력에서 한 줄을 읽어 `line`에 저장합니다. 기본적으로 줄바꿈을 만날 때까지 읽고, 그 줄바꿈은 입력에서 꺼내지만 문자열에는 넣지 않습니다. `Mina Kim` 뒤에서 누른 Enter 자체가 길이에 더해지지는 않습니다. 이름 가운데 공백 한 칸을 포함한 길이는 8입니다.

출력에 대괄호를 붙인 이유는 경계를 눈으로 확인하기 위해서입니다. 대괄호가 `line`에 저장된 것은 아닙니다. `"line=["`, `line`, `"]\n"`을 차례로 출력한 것입니다. 이 방식으로 보면 앞뒤 공백이나 빈 문자열을 확인하기가 조금 더 쉽습니다.

`getline()`은 문자열의 앞에 있는 공백을 자동으로 지우지 않습니다. 앞에 공백 두 칸을 넣어 `  Mina Kim`을 입력하면 그 두 칸도 저장됩니다. 공백을 보존하는 것이 필요한 기능인지, 지우는 것이 필요한 기능인지는 프로그램의 목적에 따라 달라집니다. 우선 읽기 단계에서 무엇을 보존하는지 정확히 알아 두세요.

### 빈 줄과 입력 실패를 구별하기

`if (!std::getline(...))`는 한 줄 읽기가 실패했는지 검사합니다. 느낌표 `!`는 조건의 참과 거짓을 뒤집습니다. 실패하면 `no line`을 출력하고 `return 0;`으로 프로그램을 끝냅니다. 성공했을 때만 다음 출력으로 진행하는 구조입니다.

아무 글자도 입력하지 않고 Enter만 누르면 빈 줄을 읽습니다. 줄바꿈을 만났으므로 읽기는 성공하고, 저장된 문자열은 비어 있습니다. 이때 출력은 다음과 같습니다.

```text
line=[]
length=0
```

반면 입력이 이미 끝나서 문자도 줄바꿈도 하나도 읽지 못했다면 읽기는 실패합니다. 파일 입력에서 처음부터 파일이 비어 있는 경우가 대표적이며, 이 프로그램은 `no line`을 출력합니다. “읽은 내용이 비었다”와 “읽을 줄이 없었다”는 서로 다른 상태입니다.

입력 끝을 EOF라고 부릅니다. 마지막 줄에 글자가 있고 그 뒤에 줄바꿈 없이 EOF가 온 경우에는 그 글자들을 정상적인 마지막 줄로 읽을 수 있습니다. EOF라는 단어를 봤다는 이유만으로 언제나 읽기 실패라고 단정하지 마세요. 이번 코드는 실제 읽기 결과를 조건으로 확인합니다.

예제는 입력을 요청하는 안내 문장을 출력하지 않습니다. 실행 후 잠시 멈춘 것처럼 보이면 한 줄을 입력하고 Enter를 누르세요. 사용자가 키보드로 입력한 글자가 콘솔에 보이는 것과 프로그램이 `cout`으로 출력한 글자는 구별해서 읽어야 합니다.

### 바꿔 보고 확인하기

평범한 한 줄, Enter만 누른 빈 줄, 공백 세 칸을 넣은 줄을 차례로 시험하세요. 각각 프로그램을 다시 실행합니다. 두 번째와 세 번째는 얼핏 비슷하지만 길이는 0과 3입니다. 입력 성공 여부와 `empty()` 결과가 서로 다른 질문이라는 점도 함께 설명해 보세요.

## 7. 숫자 다음에 이름 한 줄을 읽을 때

### 실행 전에 예상하기

숫자를 `>>`로 읽고 바로 `getline()`으로 이름을 읽으면 이름 입력이 건너뛰어진 것처럼 보일 수 있습니다. 숫자 뒤에서 누른 Enter의 줄바꿈이 아직 입력에 남아 있기 때문입니다. 이번 예제는 **첫 줄에 나이, 다음 줄에 이름**이라는 입력 규칙을 정합니다.

### 예제 07 · `07_number_then_line.cpp`

```cpp
#include <iostream>
#include <limits>
#include <string>

int main() {
    int age = 0;
    if (!(std::cin >> age)) {
        std::cout << "invalid number\n";
        return 0;
    }
    // Discard the rest of the number's line, including its newline.
    // The name must be on the NEXT line. Same-line text is discarded.
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    std::string name;
    if (!std::getline(std::cin, name)) {
        std::cout << "no name line\n";
        return 0;
    }
    std::cout << "age=" << age << '\n';
    std::cout << "name=[" << name << "]\n";
}
```

입력 예:

```text
20
Mina Kim
```

예상 출력:

```text
age=20
name=[Mina Kim]
```

### 숫자를 읽은 뒤의 입력을 생각하기

`std::cin >> age`는 숫자를 읽고 `age`에 저장합니다. 입력이 `20`과 줄바꿈이라면 숫자는 읽지만 뒤의 줄바꿈은 남겨 둡니다. 이 상태에서 곧바로 `getline()`을 호출하면 남은 줄바꿈을 만나 빈 문자열을 얻습니다. `getline()`이 고장 났거나 이름을 무시한 것이 아니라, 현재 읽을 위치에 실제로 빈 나머지 줄이 있었던 것입니다.

해결은 입력 형식에 맞게 나머지 줄을 버린 다음 다음 줄을 읽는 것입니다. 예제의 `std::cin.ignore(..., '\n');`이 그 역할을 합니다. `<limits>`와 `std::numeric_limits<std::streamsize>::max()`는 여기서 충분히 큰 읽기 한도를 지정하기 위한 표현입니다. 지금은 긴 이름을 암기하기보다, 줄바꿈을 만날 때까지 현재 줄의 나머지를 버린다는 동작을 이해하세요. 만난 줄바꿈도 함께 제거합니다.

숫자 입력이 실패하면 먼저 `invalid number`를 출력하고 종료합니다. 실패 상태를 그대로 둔 채 이름 읽기를 계속하지 않습니다. 나머지 줄을 버린 뒤 이름 줄을 읽는 데 실패하면 `no name line`을 출력합니다. 두 단계의 실패를 구분해 두면 어디까지 진행되었는지 알 수 있습니다.

### 이 해결책이 전제로 하는 입력 규칙

이 코드는 숫자 줄에 남은 내용을 전부 버립니다. 첫 줄에 `20 Mina Kim`을 입력하면 이름 부분도 함께 버립니다. 이름은 반드시 다음 줄에 있어야 합니다. `ignore()`를 “줄바꿈 하나만 없애는 명령”이라고 외우면 이 차이를 놓치기 쉽습니다. 버리는 범위와 사용자가 입력할 형식이 맞아야 합니다.

또한 숫자를 읽는 데 성공했다는 것이 첫 줄 전체가 올바른 숫자 표기라는 뜻은 아닙니다. 첫 줄에 `20abc`를 입력하면 `>> age`는 숫자 접두 부분인 20을 읽을 수 있고, 뒤의 `abc`는 `ignore()`로 버려집니다. 이 예제는 줄 전체의 엄격한 숫자 검증이나 나이 범위 검사까지 구현한 프로그램이 아닙니다. 한 줄 전체를 검증하려면 추가적인 설계가 필요합니다.

이름 줄에 Enter만 누르면 빈 이름을 성공적으로 읽습니다. 빈 이름을 허용할지는 별도의 규칙입니다. 필요하다면 읽기가 성공한 뒤 `name.empty()`를 검사해야 합니다. 단, 앞서 배웠듯 공백만 있는 이름은 `empty()`로 걸러지지 않습니다. 입력을 받는 일, 비었는지 확인하는 일, 업무 규칙에 맞는지 확인하는 일을 구분하세요.

### `std::ws`를 자동 해결책으로 쓰지 않기

다른 예제에서 `std::getline(std::cin >> std::ws, name)`을 볼 수 있습니다. 이때 `std::ws`는 앞에 남아 있는 공백 문자를 건너뜁니다. 줄바꿈뿐 아니라 이름 앞의 공백이나 연속된 빈 줄도 건너뛰므로, 빈 줄과 앞쪽 공백을 보존하려는 프로그램에는 맞지 않을 수 있습니다.

이번 목표는 숫자 줄의 나머지만 버리고 다음 줄 자체를 읽는 것입니다. 따라서 `ignore()`로 버릴 줄을 명확히 정합니다. 어느 방식이 무조건 더 좋은 것이 아니라 입력 형식과 보존할 내용이 선택 기준입니다. 문제가 생겼을 때 읽기 코드를 아무 조합으로 바꾸기보다, 지금 입력에 어떤 문자가 남아 있는지 먼저 생각해 보세요.

### 바꿔 보고 확인하기

첫 줄에 `abc`를 넣으면 `invalid number`가 나옵니다. 첫 줄에 `20abc`, 다음 줄에 `Mina Kim`을 넣으면 나이는 20으로 처리됩니다. 첫 줄은 정상 숫자로 쓰고 이름 줄 앞에 공백 두 칸을 넣으면 그 공백이 보존됩니다. 이 세 결과가 모두 위 설명과 일치하는지 확인하세요.

## 8. 선택 실험: 길이가 곧 화면의 글자 수는 아니다

### 실행 전에 예상하기

앞의 영문 예제에서는 `length()`가 눈으로 세는 글자 수와 같았습니다. 한글 `가`도 항상 길이가 1일까요? `char` 한 개의 크기가 1이라는 사실만으로 문자열의 화면상 글자 수까지 알 수 있을까요?

### 예제 08 · `08_bytes_and_text.cpp`

```cpp
#include <iostream>
#include <string>

int main() {
    // UTF-8 bytes for U+AC00, one Korean syllable. Do not print the bytes.
    std::string utf8 = "\xEA\xB0\x80";
    std::cout << "sizeof(char)=" << sizeof(char) << '\n';
    std::cout << "UTF-8 byte count=" << utf8.length() << '\n';
    std::cout << "known Unicode code points=1\n";
    // std::string counts char units, not human-perceived characters.
    // UTF-8 uses multiple bytes for many characters; sizeof(char) is always 1.
    // Do not use sizeof(std::string) to measure its stored text.
}
```

예상 출력:

```text
sizeof(char)=1
UTF-8 byte count=3
known Unicode code points=1
```

### 저장 단위와 글자를 구분하기

예제의 `"\xEA\xB0\x80"`는 한글 음절 `가`, 즉 유니코드 U+AC00을 UTF-8로 표현한 바이트 세 개를 직접 적은 것입니다. `\x` 뒤에는 16진수로 표현한 바이트 값이 옵니다. 이번 절에서는 그 값을 계산할 필요는 없습니다. 같은 한글 음절을 표현하는 데 이 바이트 세 개가 함께 쓰인다는 점을 확인하면 됩니다.

`std::string`은 내용이 UTF-8인지 이해해서 글자를 세어 주는 자료형이 아닙니다. 저장된 `char` 단위의 개수를 셉니다. UTF-8에서는 이것을 코드 단위 수라고도 부릅니다. 이 예제에는 세 단위가 들어 있으므로 `length()`와 `size()`는 모두 3입니다. Visual Studio/MSVC 환경에서 이 UTF-8 문자열의 길이는 저장된 바이트 수라고 읽을 수 있습니다.

`sizeof(char)`의 값은 C++에서 항상 1입니다. 이것은 `char` 한 개가 차지하는 크기를 나타냅니다. 예제의 문자열에는 그 단위가 세 개 있으므로 길이가 3인 것과 모순되지 않습니다. 한 칸의 크기와 사용한 칸의 개수는 다른 값입니다.

마지막 출력의 1은 프로그램이 유니코드를 분석해서 계산한 결과가 아닙니다. 우리가 예제에 넣은 특정 음절이 유니코드 코드 포인트 하나라는 사실을 문장으로 출력한 것입니다. 일반적인 문자열에서 글자 수를 구하는 알고리즘으로 사용하면 안 됩니다.

더 나아가 화면에서 하나로 보이는 글자와 유니코드 코드 포인트 하나도 언제나 같지는 않습니다. 여러 코드 포인트가 결합해 하나처럼 표시되기도 합니다. 이번 수업에서는 다음 정도만 기억하면 충분합니다. `std::string::length()`는 저장 단위를 세며, 사람이 읽는 글자 수를 보장하지 않습니다. 따라서 한글이나 이모지의 길이를 모두 일정한 수로 나누어 글자 수를 구하는 방법도 일반적인 해결책이 아닙니다.

`sizeof(std::string)` 역시 저장된 글자의 개수를 구하는 방법이 아닙니다. 문자열 객체 자체의 크기와 현재 내용의 길이는 다른 질문입니다. 내용의 길이가 필요하면 `length()` 또는 `size()`를 사용하고, 사람이 인식하는 글자 수가 필요하면 별도의 유니코드 처리를 고민해야 합니다.

### UTF-8 소스와 콘솔 출력은 별개

이 예제는 한글 바이트를 직접 출력하지 않고 영문과 숫자만 출력합니다. 따라서 한글 표시가 터미널 설정에 따라 달라지는 문제와 길이를 세는 실험을 분리할 수 있습니다. 소스를 UTF-8로 저장하고 `/utf-8`로 컴파일했더라도 콘솔이 출력 바이트를 다른 인코딩으로 해석하면 한글이 깨질 수 있습니다. 입력으로 들어오는 바이트의 인코딩도 별도로 영향을 받습니다.

C++20에서 인터넷의 오래된 코드를 따라 문자열 앞에 무조건 `u8`을 붙이지 마세요. C++20의 `u8` 문자열 리터럴은 `char8_t` 계열이므로 보통의 `std::string` 초기화와 그대로 호환되지 않습니다. 지금은 `char8_t`의 변환 방법까지 배우지 않습니다. 이번 예제의 표기를 그대로 사용하고, UTF-8이라는 이름만 같다고 모든 문자열 자료형이 같은 것은 아니라는 점만 알아 둡시다.

### 바꿔 보고 확인하기

비교 대상으로 `std::string english = "ABC";`를 만든 뒤 길이를 출력해 보세요. 이 문자열도 길이는 3입니다. 그러나 영문 세 글자와 앞의 한글 한 음절은 화면상 내용이 다릅니다. 길이가 같다는 것만으로 같은 개수의 글자가 보인다고 결론 낼 수 없는 이유를 말해 보세요.

## 9. 직접 풀어 보는 여섯 문제

각 문제를 독립 프로그램으로 작성하세요. 먼저 예상 결과를 적고, 코드를 만든 다음, 실제 출력과 비교합니다. 결과가 맞아도 설명할 수 없는 줄이 있다면 해당 절로 돌아가 읽어 보세요.

1. 빈 `std::string`을 만들고 `empty()` 결과를 출력하세요. 공백 한 칸을 대입한 후 결과를 다시 출력하세요. 두 결과가 다른 이유도 적으세요.
2. `std::string name = "Mina";`로부터 `Hello, Mina!`를 만드세요. 이름 변수의 원래 내용을 유지하고 새 문자열에 결과를 저장하세요.
3. `"banana"`에서 `"ban"`을 찾고, 못 찾은 경우와 0번 위치에서 찾은 경우를 구분해 출력하세요. 결과를 `if (position)`으로 검사하면 왜 안 되는지도 설명하세요.
4. `"banana"`에서 `"pear"`를 찾으세요. 못 찾았을 때 특별한 위치 값의 숫자를 출력하지 말고 `not found`를 출력하세요.
5. 나이와 이름을 서로 다른 줄에서 입력받으세요. 이름의 공백을 보존하고 숫자 읽기 실패와 이름 줄 읽기 실패를 처리하세요. `20abc`가 엄격하게 거부되는 프로그램인지도 설명하세요.
6. 예제 08의 UTF-8 문자열에서 `length()`가 3인 이유를 설명하세요. `sizeof(char)`가 1인 것과 모순인가요? `sizeof(std::string)`으로 문자열 길이를 알아낼 수 있나요?

## 10. 정답과 풀이

아래 1~4번은 **코드 조각**입니다. 독립 실행하려면 `#include <iostream>`, `#include <string>`을 넣고 코드를 `int main()` 안에 작성하세요.

### 1번 · 빈 문자열과 공백

```cpp
std::string text;
std::cout << std::boolalpha << text.empty() << '\n';
text = " ";
std::cout << text.empty() << '\n';
```

출력은 차례로 `true`, `false`입니다. 처음에는 저장된 내용이 없고, 나중에는 공백 한 칸이 있습니다. 공백이 눈에 잘 보이지 않는다는 것과 문자열이 비어 있다는 것을 구분해야 합니다.

### 2번 · 인사말 만들기

```cpp
std::string name = "Mina";
std::string result = "Hello, " + name;
result += '!';
std::cout << result << '\n';
```

`result`에는 `Hello, Mina!`가 저장되고 `name`은 `Mina`로 남습니다. 인사말의 쉼표 뒤 공백은 직접 적은 것입니다. `+=`는 기존 결과 뒤에 느낌표를 추가합니다.

### 3번 · 0번 위치도 성공

```cpp
std::string text = "banana";
auto position = text.find("ban");
if (position == std::string::npos) {
    std::cout << "not found\n";
} else {
    std::cout << "found at " << position << '\n';
}
```

출력은 `found at 0`입니다. 0은 문자열의 첫 위치이며 정상적인 검색 성공입니다. 숫자의 참·거짓 변환에 맡기지 않고 `npos`인지 명시적으로 비교해야 합니다.

### 4번 · 검색 실패는 의미로 출력하기

```cpp
std::string text = "banana";
if (text.find("pear") == std::string::npos) {
    std::cout << "not found\n";
}
```

`pear`가 없으므로 `not found`가 출력됩니다. `npos`의 구체적인 숫자는 프로그램 사용자가 알아야 할 검색 결과가 아닙니다. 코드에서는 이름으로 비교하고, 화면에는 뜻을 전달하세요.

### 5번 · 숫자 줄 다음에 이름 줄

완전한 정답은 7절의 `07_number_then_line.cpp`입니다. 순서는 숫자 읽기 성공 확인, 숫자 줄의 나머지 버리기, 다음 줄 읽기 성공 확인, 결과 출력입니다. `<limits>`도 포함해야 합니다.

`ignore()`는 같은 줄에 남은 이름도 버리므로 이름은 다음 줄에 입력합니다. `20abc`는 숫자 접두 부분 20을 읽고 나머지를 버릴 수 있어 엄격한 숫자 검증이 아닙니다. 이름의 앞쪽 공백이나 빈 이름 줄은 보존됩니다. 빈 이름을 금지하려면 읽기 성공 여부와 별도로 내용 검사를 추가해야 합니다.

### 6번 · 서로 다른 것을 센다

해당 음절의 UTF-8 표현을 이루는 바이트 세 개가 문자열에 저장되어 있습니다. `length()`는 저장된 `char` 단위 수를 세므로 3입니다. `sizeof(char)`는 단위 하나의 크기이므로 1입니다. 서로 다른 것을 세기 때문에 모순이 아닙니다. `sizeof(std::string)`은 객체 자체의 크기이므로 그 안에 저장된 문자열 길이를 구하는 방법이 아닙니다.

## 마무리 점검

다음 문장을 자기 말로 설명할 수 있으면 이번 수업의 목표를 달성했습니다.

- `length()`와 `size()`는 같지만, 그 값이 언제나 화면상 글자 수는 아니다
- 빈 문자열과 공백 한 칸이 들어 있는 문자열은 다르다
- `+`로 만든 결과를 저장하는 것과 `+=`로 기존 변수에 붙이는 것은 구분해야 한다
- 검색 결과 0은 성공할 수 있으며, 검색 실패는 `npos`와 비교한다
- `char`와 `std::string`은 출력이 비슷해 보여도 다른 자료형이다
- `getline()`에서 빈 줄을 읽는 성공과 아무것도 읽지 못한 실패는 다르다
- 숫자 뒤에 `ignore()`를 쓰면 현재 줄의 나머지 전체가 버려진다

문자열 프로그램이 예상과 다르게 동작하면 세 가지를 먼저 확인하세요. 지금 변수에 어떤 내용이 저장되어 있는지, 위치와 길이를 혼동하지 않았는지, 입력에 아직 무엇이 남아 있는지입니다. 이 세 질문만으로도 이번 수업에서 만난 많은 실수의 원인을 좁힐 수 있습니다.

## 예제 파일 받기

[전체 예제 소스 ZIP 받기](/cpp-jeongseok/assets/examples/02-2/02-2-string-examples.zip) · [Visual Studio 실행 안내](/cpp-jeongseok/assets/examples/02-2/README.md)

ZIP에는 아래 C++ 소스 8개와 실행 안내만 들어 있습니다. 각 파일은 독립 프로그램이므로 하나씩 빌드하세요.

- [01_length_empty.cpp](/cpp-jeongseok/assets/examples/02-2/01_length_empty.cpp)
- [02_concatenation.cpp](/cpp-jeongseok/assets/examples/02-2/02_concatenation.cpp)
- [03_find_npos.cpp](/cpp-jeongseok/assets/examples/02-2/03_find_npos.cpp)
- [04_find_boundaries.cpp](/cpp-jeongseok/assets/examples/02-2/04_find_boundaries.cpp)
- [05_char_and_string.cpp](/cpp-jeongseok/assets/examples/02-2/05_char_and_string.cpp)
- [06_getline.cpp](/cpp-jeongseok/assets/examples/02-2/06_getline.cpp)
- [07_number_then_line.cpp](/cpp-jeongseok/assets/examples/02-2/07_number_then_line.cpp)
- [08_bytes_and_text.cpp](/cpp-jeongseok/assets/examples/02-2/08_bytes_and_text.cpp)

## 참고 자료

아래는 설명을 더 확인할 때 사용할 공식 참고 자료입니다. 본문은 이 수업을 위해 새로 구성한 예제 중심의 설명입니다.

- [Microsoft Learn · `basic_string` 클래스](https://learn.microsoft.com/en-us/cpp/standard-library/basic-string-class?view=msvc-170): `std::string`의 길이, 비어 있음, 검색, 위치 자료형과 `npos`의 상세 참조
- [Microsoft Learn · `<string>` 함수](https://learn.microsoft.com/en-us/cpp/standard-library/string-functions?view=msvc-170): `getline()`과 문자열 결합 관련 함수 참조
- [Microsoft Learn · `/utf-8` 옵션](https://learn.microsoft.com/en-us/cpp/build/reference/utf-8-set-source-and-executable-character-sets-to-utf-8?view=msvc-170): 소스 및 실행 문자 집합 설정

- [C++20 고정 초안 N4861 · 문자열 길이](https://timsong-cpp.github.io/cppwp/n4861/string.capacity): `size()`와 `length()`의 정의, 종단 널 제외
- [C++20 고정 초안 N4861 · 문자열 입출력](https://timsong-cpp.github.io/cppwp/n4861/string.io): `getline()`의 구분자와 입력 실패 조건
- [C++20 고정 초안 N4861 · 문자열 리터럴](https://timsong-cpp.github.io/cppwp/n4861/lex.string): C++20의 `u8` 리터럴과 `char8_t`
