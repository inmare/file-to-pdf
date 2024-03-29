# File to PDF converter

파일을 특정한 종류의 문자열로 바꾸어 준 다음, 설정에 맞는 pdf로 바꿔주는 프로그램입니다.

# 목적

제가 제작한 간단한 머신러닝 프로그램이 읽기 쉽도록 일정한 형태의 문자열로 바꾸는 것이 이 프로그램의 목적입니다.  
자세한 내용은 설명란의 사이트를 참고해주세요.

# 파일 종류 감지 알고리즘

사실 어떤 파일을 감지해서 아스키코드가 있는지 없는지 파악한 다음, 있다면 Ascii, 없다면 Base64모드로 설정을 하면 제일 간단하겠지만, 그래도 나름대로 파일의 종류를 감지하는 알고리즘을 작성했습니다.  
아래는 해당 알고리즘의 처리과정입니다.

1. 파일을 텍스트 형태로 읽음
2. 텍스트에 아스키코드만 포함되어 있는지 확인
3. 아스키코드만 있다면 무조건 Ascii모드
4. 만약 아스키코드가 아닌 문자가 포함되어 있다면, 파일에 CJK문자도 포함되어 있는지 확인
5. 만약 CJK문자가 있고, 용량이 20kb이하이면 Unicode모드
6. CJK문자가 없고, 용량이 20kb이하면 Hex모드
7. 위의 조건을 모두 충족 못하면 Base64모드

# 변환된 텍스트 파일의 구조

변환된 파일들은 전부 글자의 맨 앞부분에 파일에 관한 정보를 담고 있습니다.  
그 구조는 아래와 같습니다.

`ABBCCC[파일 이름(유니코드화)]`

- `A` : 변환 모드입니다. `0(Ascii)`, `1(Hex)`, `2(Unicode)`, `3(Base64)` 중 하나입니다.
- `BB` : 파일 이름을 유니코드화 했을 때의 길이를 10진수 정수로 나타냅니다.
- `CCC` : 맨 마지막 줄에 있는 글자들 중 줄 길이 맞추기 용 글자가 아닌, 실제 파일 부분의 글자의 길이를 10진수 정수로 나타냅니다.
- `파일이름(유니코드화)`: 파일 이름을 각 4자리의 유니코드화한 문자열입니다.

# TODO

- [ ] 파일을 다 생성하면 볼 수 있는 링크를 화면에 표시하기
- [ ] 첫번째 페이지의 글자 표의 글자들은 본문 텍스트의 폰트로 폰트 설정하기
- [x] 개행문자, 탭 변경 문자 추가하기
- [x] 띄어쓰기, 개행문자, 탭과 같이 무조건 변환 문자가 있어야 하는 문자들은 표에서 뺄 경우 경고 메세지 출력하기
- [ ] Text input에 들어가는 숫자가 PDF에 맞지 않을 정도로 클 때 그에 대한 경고 출력
- [ ] 파일 이름의 길이가 너무 길면 경고 출력
- [ ] 첫 페이지 가이드에서 표의 길이가 너무 길면 자동으로 다음 줄로 넘어가는 기능 추가
