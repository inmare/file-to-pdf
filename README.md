# File to PDF converter

일반 파일이나 텍스트 파일을 pdf로 변환합니다.

일반 파일의 경우에는 각 byte를 hex형태로, 텍스트 파일의 경우 아스키코드의 경우에는 그대로, 유니코드의 경우에는 유니코드 기호로 변환해줍니다.

# 목적

제가 제작한 간단한 머신러닝 프로그램(github엔 아직 없음)이 읽기 쉽도록 텍스트 파일을 정해진 형식의 pdf로 바꿔줍니다.

# 변환된 텍스트 파일의 구조

변환된 파일들은 전부 글자의 맨 앞부분에 파일에 관한 정보를 16진수 정수로 담고 있습니다.  
구조의 내용들은 추후에 바뀔 수 있습니다.

## 텍스트 파일

`AA BB CC DD EE <파일 이름> <공백 대체 문자> ...(파일의 실제 내용)`

- **A**: 파일의 종류. 일반 텍스트 파일일 경우 02입니다.
- **B**: 파일 이름의 길이
- **C**: 띄어쓰기를 대체하는 글자의 길이
- **D**: 마지막 페이지의 줄 수
- **E**: 마지막 줄의 글자 수

## 텍스트 파일(유니코드), 일반 파일

`AA BB CC DD EE <파일 이름> ...(파일의 실제 내용)`

파일 이름은 유니코드로 바뀌어서 저장됩니다.

- **A**: 파일의 종류가 유니코드 텍스트 파일인지 일반 파일인지 알려줍니다.  
  유니코드 텍스트 파일의 경우 00, 일반 파일의 경우 01입니다.
- **B**: 파일 이름의 길이
- **C**: 마지막 페이지의 줄 개수
- **D**: 마지막 줄의 글자 개수
- **E**: 일반 텍스트 파일과 데이터 길이를 맞추기 위한 공백으로 00이 들어갑니다.

# 텍스트 파일의 공백 문자 변환 과정

작성 예정

# TODO

- [x] `<select>`로 선택지 추가하기
- [x] 텍스트로 pdf파일 생성하기
- [ ] 자체 알고리즘을 이용해서 랜덤한 텍스트 생성
- [ ] pdf파일에 가이드라인 및 추가 정보추가
