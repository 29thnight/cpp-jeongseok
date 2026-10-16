# C++의 정석

C++20을 기준으로 만드는 한국어 현대 C++ 교재. 현재 **제1판 초안**이며 소개 글 1편만 공개되었습니다. 본 강좌 목차는 집필 계획입니다.

## 사이트

GitHub Pages: https://29thnight.github.io/cpp-jeongseok/

- `content/introduction.md`: 소개 글 원문 (Markdown)
- `content/chapters.json`: 공개/준비 중 상태와 목차
- `scripts/build.mjs`: 정적 HTML 생성기 (Node.js 20 이상)
- `assets/`: 공통 스타일, 검색 및 목차 기능, 자체 호스팅 폰트
- `docs/`: 빌드 결과물. GitHub Pages는 `main` 브랜치의 `/docs`에서 배포합니다

## 수정과 검증

```sh
npm ci
npm run build
npm test
```

원문 또는 자산을 수정한 뒤 `docs/`의 변경도 함께 커밋합니다. `npm test`는 생성된 HTML의 로컬 자산, 내부 링크와 앵커, 프로젝트 기본 경로를 검사합니다. `docs/`를 `/cpp-jeongseok/` 아래에 매핑하는 정적 서버로 미리 보세요. C++ 코드 블록은 빌드 시 highlight.js로 구문 강조합니다. 브라우저에서 별도의 구문 강조 스크립트나 CDN을 로드하지 않습니다. 미지원 언어는 안전하게 이스케이프한 일반 코드로 표시합니다.

검색은 브라우저에서 목차를 필터링하며, 준비 중인 강좌는 링크를 제공하지 않습니다.

새 강좌를 추가할 때는 Markdown 원문과 `chapters.json`의 항목을 함께 추가하고 `build.mjs`의 페이지 생성 로직을 확장합니다. 현재 빌더는 소개 페이지를 생성하는 작은 초기 구조입니다.

## 편집 원칙

- 교재의 **판본**과 C++의 **언어 표준**을 분리해서 표기
- 안전하고 현대적인 기본 관용구와 표준 라이브러리를 먼저 소개
- 값, 수명, 소유권, 타입과 설계를 연결
- 특정 엔진의 사용법에 한정하지 않고 큰 C++ 코드베이스를 읽는 기반 마련
- 작성하지 않은 내용을 공개된 것처럼 표시하지 않음

## 댓글

GitHub Discussions / giscus 연결은 아직 설정하지 않았습니다. 사이트에는 준비 중 상태만 표시하며 외부 댓글 스크립트를 로드하지 않습니다. 앱 설치 및 권한 승인을 받은 후 별도 작업으로 연결합니다.

## 디자인 및 폰트

사용자가 제공한 JetBrains Blog 화면의 출판형 헤더, 밝은 기사 본문, 넓은 여백, 오른쪽 목차 구조를 참고했습니다. JetBrains 로고, 기사 본문, 차트 또는 이미지는 복제하지 않았습니다. 독자적인 C++ 브랜드와 커버 그래픽을 사용합니다.

제목, 본문, 코드 모두 NAVER의 D2Coding을 사용합니다. 폰트는 외부 CDN 요청 없이 자체 호스팅하며 `font-display: swap`을 사용합니다. 출처와 SIL OFL 라이선스는 `assets/fonts/`에 있습니다. 폰트 라이선스는 교재 원문과 사이트 코드의 라이선스를 의미하지 않습니다. **교재/사이트 라이선스는 아직 선택하지 않았습니다.**

헤더에는 사용자가 제공한 C++ 로고 PNG 원본을 사용합니다. 비율과 색상을 유지하며 이미지 자체는 변형하지 않았습니다. 로고의 권리는 해당 권리자에게 있습니다.

## 코드 색상표

Microsoft의 [Visual Studio C++ Enhanced 스타일 테마](https://github.com/microsoft/vscode-cpptools/blob/main/Themes/themes/cpptools_dark_vs_new.json)를 기준으로 합니다. Microsoft는 이 동반 테마가 Visual Studio Enhanced와 가깝게 맞춘 테마라고 [설명](https://github.com/microsoft/vscode-cpptools/blob/main/Themes/README.md)합니다. MSVC 컴파일러 자체에 색상표가 있는 것은 아닙니다.

- 키워드/기본 타입: `#569CD6`, 제어 흐름: `#D8A0DF`
- STL 타입: `#4EC9B0`, 지역변수: `#9CDCFE`, 함수: `#DCDCAA`
- 문자열: `#CE9178`, 숫자: `#B5CEA8`, 주석: `#57A64A`
- 배경: `#1E1E1E`

구문 강조는 highlight.js와 선언 패턴을 보완한 정적 어휘 분석입니다. 컴파일러나 IntelliSense의 완전한 의미 분석은 아니며 복잡한 별칭, 매크로, 이름 가림 등을 정확히 구분한다는 보장은 없습니다. 현재 소개 예제의 `std::vector`, `std::string`, `topic`, `topics` 선언과 사용은 테스트로 검증합니다. 본문 인라인 코드는 별도 스타일을 유지합니다.

표지의 C++ 글자에만 Noto Sans Bold를 자체 호스팅하여 사용합니다. 본문과 코드 등 나머지 텍스트는 D2Coding입니다. Noto Sans의 SIL OFL 1.1 및 출처는 `assets/fonts/NotoSans-LICENSE.txt`에 포함했습니다.

## 수업별 집필 상태

본편 53수업과 선택 심화 4수업의 [진척표](curriculum/PROGRESS.md), [원본 상태](curriculum/state.json), [집필·재개 절차](curriculum/WORKFLOW.md)를 관리합니다. 기존 소개 1편은 별도이며 본편 완료로 세지 않습니다. 게시준비와 게시완료는 구분합니다.

```sh
python3 scripts/curriculum.py validate
python3 scripts/curriculum.py next
python3 scripts/curriculum.py render --check
python3 -m unittest discover -s tests -v
```

`next`는 다음 작은 작업의 후보를 제안할 뿐 집필·게시하지 않습니다. 예약 주기와 실제 집필 실행기는 별도로 관리합니다. 실행 환경이 바뀌어도 이어갈 수 있도록 비공개 영속 초안 보관과 원격 상태 확인을 먼저 연결해야 합니다. 검토 전 본문과 비공개 참고 자료는 공개 저장소에 저장하지 않습니다.
