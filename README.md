# Alastor's Radio 99.6 FM

빈티지 라디오 콘셉트의 웹 오디오 플레이어입니다. 로컬 오디오 파일 업로드, 직접 재생 가능한 오디오 URL, GitHub 오디오 파일 링크, YouTube 링크 재생을 지원합니다.

YouTube 링크는 브라우저에서 직접 오디오를 추출하지 않고, Python 서버가 `yt-dlp`로 오디오 스트림 URL을 가져온 뒤 프론트엔드의 `<audio>` 플레이어로 재생합니다.

## Features

- 빈티지 라디오 스타일 UI
- 주파수 슬라이더와 가상 라디오 스테이션
- 로컬 오디오 파일 업로드 재생
- GitHub `blob` 오디오 링크를 raw URL로 변환해 재생
- YouTube 링크를 Python 서버를 통해 오디오로 재생
- 북마크를 `localStorage`에 저장
- 재생 중 앨범 아트 회전과 비주얼라이저 애니메이션

## Project Structure

```txt
.
├── index.html
├── style.css
├── script.js
├── server.py
├── requirements.txt
└── README.md
```

## Setup

Python 의존성을 설치합니다.

```bash
pip install -r requirements.txt
```

## Run

프로젝트 폴더에서 Python 서버를 실행합니다.

```bash
python server.py
```

브라우저에서 아래 주소로 접속합니다.

```txt
http://127.0.0.1:8000/
```

YouTube 오디오 기능은 반드시 이 서버 주소로 접속해야 동작합니다. `index.html`을 파일로 직접 열면 `/api/youtube-audio` API를 사용할 수 없습니다.

## Open On Phone

스마트폰에서도 같은 Wi-Fi에 연결되어 있다면 접속할 수 있습니다.

1. 컴퓨터에서 서버를 실행합니다.

```bash
python server.py
```

2. 터미널에 표시되는 스마트폰용 주소를 확인합니다.

```txt
Open on your phone at http://192.168.x.x:8000
```

3. 스마트폰 브라우저에서 해당 주소로 접속합니다.

Windows 방화벽 알림이 뜨면 Python의 네트워크 접근을 허용해야 스마트폰에서 접속할 수 있습니다.

## Notes

- 일부 YouTube 영상은 연령 제한, 지역 제한, 저작권 설정, 비공개/임베드 제한 등으로 재생되지 않을 수 있습니다.
- `yt-dlp`가 가져오는 오디오 스트림 URL은 시간이 지나면 만료될 수 있습니다.
- 이 프로젝트는 로컬 학습 및 개인 테스트 용도에 가깝습니다. 공개 배포나 상업적 사용 시에는 YouTube 이용약관과 저작권을 확인해야 합니다.
