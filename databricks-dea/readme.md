# Databricks DEA Practice

Databricks Certified Data Engineer Associate를 위한 한국어 문제 풀이 웹사이트입니다. 핵심 개념학습, 카테고리별 연습과 **모의고사 1회 · 45문항 · 90분**을 제공합니다.

문제는 공식 시험 범위와 공개 샘플의 형식을 참고해 독립 제작했습니다. 실제 기출문항·공식 문제은행이 아니며, 실제 시험과 동일한 난이도를 검증한 세트는 아닙니다.

## 실행

Node.js 20 이상에서 추가 패키지 설치 없이 실행합니다.

```bash
npm start
```

브라우저에서 [DEA Practice · localhost:3000](http://127.0.0.1:3000)을 여세요. 다른 포트는 `PORT=3001 npm start`로 지정할 수 있습니다. 서버는 기본적으로 현재 컴퓨터의 loopback에만 연결합니다.

```bash
npm test
```

## 업로드한 PDF 분석

분석 대상: `ai-prep-guide-any-databricks-certification.pdf`, 총 3쪽. 제목은 **AI Prep Guide: Any Databricks Certification**입니다.

이 문서는 Data Engineer Associate 전용 시험 범위나 기출 문제집이 아니라, 어떤 Databricks 자격시험이든 AI를 학습 파트너로 활용하는 방법을 설명합니다. 따라서 PDF 자체에서 문항이나 출제 비중을 추출할 수는 없습니다. 이번 사이트의 학습 흐름은 이 PDF를, 출제 범위·비중은 별도로 확인한 공식 Associate 시험 가이드를 기반으로 했습니다.

### PDF의 6단계 학습 절차

1. **준비하기 — 1쪽.** 시험 날짜, 해당 시험의 최신 Exam Guide, AI 도구, Databricks Free Edition 또는 Trial, Academy, 학습 기록을 준비합니다. 시험 2주 전에는 가이드가 바뀌었는지 다시 확인합니다.
2. **AI에 시험 범위 지정하기 — 1–2쪽.** 매 세션 공식 가이드를 제공하고, 가이드에 없는 목표를 추가하지 않도록 요청합니다. 주요 설명은 공식 문서와 Academy로 확인하고, 검증되지 않은 내용은 명확히 구분합니다.
3. **바뀐 제품명 점검하기 — 2쪽.** AI가 오래된 이름과 동작을 사용할 수 있으므로 과거 이름·현재 이름·기능을 표로 정리하고 공부할 때 재사용합니다.
4. **영역별 학습 루프 — 2–3쪽.** 목표 개요 파악 → 객관식 진단 → 틀린 목표 심화 학습 → 비중에 맞춘 전체 모의고사 → 오개념 보완 순서입니다. 모의고사는 제출 전까지 답을 숨기고, 오답에 대해서는 정답 이유와 같은 개념의 변형 문제를 학습하도록 권합니다.
5. **직접 실습하기 — 3쪽.** 시험 목표에 대응하는 6–10개 작은 작업을 선정해 각각 30분 이내의 실습으로 수행합니다. 스스로 완료하지 못한 작업이 다음 공부 대상입니다.
6. **시간 배분하기 — 3쪽.** 준비 기간의 첫 25%는 진단, 중간 50%는 약점과 실습, 마지막 25%는 전체 모의고사에 사용합니다. AI 모의고사 점수보다 목표의 전 범위 이해와 실습 자신감을 중요하게 봅니다.

핵심은 **정답 암기보다 진단 → 공식 근거 확인 → 실습 → 오답 보완**입니다. 이번 버전에서는 진단·모의고사·선택지별 해설·공식 문서 링크를 구현했습니다. 추가 변형 문제 자동 생성이나 AI 튜터는 포함하지 않습니다.

## 시험 기준과 카테고리

2026-10-08에 확인한 [공식 시험 안내](https://www.databricks.com/learn/certification/data-engineer-associate)와 [2026년 5월 시험 가이드](https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf)를 기준으로 구성했습니다. 가이드가 설명하는 시험 버전은 2026-05-04부터 적용됩니다.

| 공식 영역 | 출제 비중 | 1회 문항 수 | 이번 세트의 주요 유형 |
| --- | ---: | ---: | --- |
| Databricks Intelligence Platform | 6% | 3 | Delta Lake·Unity Catalog 역할, 컴퓨트 선택 |
| Data Ingestion and Loading | 21% | 9 | Auto Loader 코드, 체크포인트, 스키마 진화, COPY INTO, 수집 방식 선택 |
| Data Transformation and Modeling | 22% | 10 | SQL·PySpark 결과 해석, 조인·중복 제거, 품질 규칙, Gold 객체 |
| Working with Lakeflow Jobs | 16% | 7 | 태스크 의존성·복구·분기·반복·트리거 |
| Implementing CI/CD | 10% | 5 | Git 개발 흐름, Bundles, targets, CLI 배포 |
| Troubleshooting, Monitoring, and Optimization | 10% | 4 | Skew·Driver OOM 진단, Liquid Clustering, 자동 유지보수 |
| Governance and Security | 15% | 7 | 객체 계층, 최소 권한, managed/external, row filter·mask·ABAC |
| **합계** | **100%** | **45** | |

정수 문항 배분은 비중 × 45를 내림한 뒤 소수 부분이 큰 영역에 나머지를 배정했습니다. CI/CD와 모니터링의 동률은 CI/CD에 한 문항을 먼저 배정했습니다. 공식 시험에서 이 문항 수가 정확히 보장된다는 뜻은 아닙니다. 1세트는 각 영역을 대표하는 테스트용 세트이며 모든 세부 목표를 개별 문항으로 커버하지는 않습니다.

공식 시험은 객관식 채점 문항 45개와 90분을 안내합니다. 비채점 문항이 포함되는 경우 추가 시간이 반영될 수 있으나 이번 모의고사는 비채점 문항 없이 45개로 고정합니다. 임의의 공식 합격선을 설정하지 않고 정답 수와 정답률을 표시합니다.

### 참고 GitHub 자료의 활용

사용자가 제공한 [kengio 학습 저장소](https://github.com/kengio/databricks-certification-study-guide/tree/main/certifications/data-engineer-associate)의 Associate README를 확인해 학습 주제와 모의고사 구성 방향을 참고했습니다. 그 README는 기존 5영역 비중을 legacy라고 명시합니다. 이번 사이트는 그 비중을 그대로 사용하지 않고 최신 공식 7영역 비중을 사용합니다.

저장소의 모의고사 하위 문서 본문은 이번 환경에서 가져오지 못해 해당 문제를 분석·복사했다고 주장하지 않습니다. 문항 본문과 해설은 별도로 작성했습니다.

### 제품명 정리

| 익숙한 과거 이름 | 이번 학습에서 사용하는 이름 |
| --- | --- |
| Databricks Workflows의 job orchestration | Lakeflow Jobs |
| Databricks Repos | Databricks Git folders |
| Delta Live Tables | Lakeflow Spark Declarative Pipelines |
| Databricks Asset Bundles | Declarative Automation Bundles |

이름 변경과 지원 기능은 계속 바뀔 수 있습니다. [Bundles 공식 문서](https://docs.databricks.com/aws/en/dev-tools/bundles/), [Lakeflow Jobs 공식 문서](https://docs.databricks.com/aws/en/jobs/) 및 자신의 Databricks 환경을 함께 확인하세요.

## 개념학습

상단 **개념학습** 탭에서 핵심 18개를 추천 순서로 읽고 7개 영역으로 필터링할 수 있습니다. 각 카드에 짧은 핵심 설명과 기억할 한 줄을 표시하며, 시험 포인트·헷갈리는 점·일부 코드 예제는 펼쳐서 볼 수 있습니다. 공식 문서와 해당 영역 연습으로 바로 연결됩니다.

Medallion, 수집 도구 선택, 체크포인트, 스키마 진화, 조인·중복 제거, SQL 기본 동작, Unity Catalog 권한, Jobs 제어 흐름을 먼저 다룹니다. 이어 품질 규칙, Gold 객체, 테이블 수명 주기, 마스킹·ABAC, Bundles, 장애 진단·최적화와 플랫폼 역할을 정리합니다. 순서는 공식 영역 비중과 학습 선후 관계로 정했으며 실제 기출 빈도 통계에 따른 순위는 아닙니다.

개념학습으로 이동해도 진행 중인 모의고사의 타이머는 계속 흐릅니다. 새 영역 연습을 시작할 때는 기존 답안을 대체하기 전에 확인합니다.

## 문제 풀이 기능

- **한국어·영어 문제:** 45문항 모두 한국어 문제 바로 아래에 영어 번역을 표시합니다. 제출 후 복습에도 영어를 제공합니다. 선택지는 한국어이며 코드는 공통입니다.

- **모의고사 1회:** 고정된 45문항을 카테고리가 섞인 순서로 제공하고 시작 시 90분을 계산합니다. 문항별 정답은 하나입니다.
- **카테고리별 연습:** 선택한 영역의 문제만 풀며 시간 제한이 없습니다. 답을 선택한 뒤 정답 확인을 누르면 해설이 열리고 해당 답은 잠깁니다.
- **문제 유형:** 상황 판단, 코드 해석, 장애 진단, 개념 이해를 문항에 표시합니다.
- **실전 흐름:** 이전/다음, 문항 번호 이동, 검토 표시, 미응답 수, 제출 확인을 제공합니다. 제출 전에 모의고사 정답을 화면에 공개하지 않습니다.
- **시간 종료:** 남은 시간이 0이 되면 자동 채점합니다. 비활성 탭이나 새로고침 뒤에도 절대 종료 시각을 기준으로 계산합니다.
- **채점과 복습:** 전체 정답률, 영역별 정답 수, 미응답, 소요 시간, 선택지별 정답·오답 이유와 공식 문서 링크를 제공합니다. 전체/오답·미응답/미응답/검토 표시로 복습할 수 있습니다.
- **현재 브라우저에 저장:** 답안·검토 표시·남은 시험 시간을 localStorage로 복원합니다. 서버 DB나 계정 간 동기화는 없으며, 새 학습을 시작하면 이전 세션을 대체합니다.

카테고리 연습과 모의고사는 **동일한 45문항**입니다. 이미 연습한 문제의 모의고사 점수는 처음 보는 문제에 대한 실력 측정과 다릅니다. 모든 문항은 4지선다 한 개 선택형으로 제작했습니다.

## 실습 체크리스트

PDF의 실습 원칙을 이 시험에 맞춰 적용한 예시입니다. 아래는 별도 시험 문제 세트가 아닙니다. 사용 환경이 기능을 지원하는지 확인하고 실습하세요.

| 작은 실습 | 대응 영역 |
| --- | --- |
| Delta 테이블 생성·쓰기 후 이전 버전 조회와 보존 정책 확인 | 플랫폼 |
| COPY INTO를 두 번 실행해 파일 단위 증분 적재 확인 | 수집·적재 |
| Auto Loader의 스키마·체크포인트 경로를 구성하고 새 파일 적재 | 수집·적재 |
| Bronze의 NULL·잘못된 금액을 처리하고 Silver 작성 | 변환·모델링 |
| 복합 키 조인과 최신 행 중복 제거를 작은 데이터로 확인 | 변환·모델링 |
| ingest → clean → publish DAG 구성과 실패 태스크 repair | Lakeflow Jobs |
| Bundle의 dev/prod targets 검증과 테스트 환경 배포 | CI/CD |
| 작은 조인 작업의 Spark UI에서 셔플와 태스크별 실행 시간 확인 | 모니터링 |
| 테스트 그룹에 USE CATALOG·USE SCHEMA·SELECT 부여 후 회수 | 거버넌스 |
| 테스트 데이터에서 row filter와 column mask 적용 결과 비교 | 거버넌스 |

## 구조와 개발 범위

```text
readme.md                 PDF 요약, 시험 기준, 실행·연결 안내
package.json              의존성 없는 Node 실행·테스트 명령
server.mjs                로컬 HTTP 서버; site/dist만 제공
site/dist/index.html      화면 골격
site/dist/styles.css      데스크톱·모바일 레이아웃
site/dist/app.mjs         문제 풀이·결과·저장·선택적 WebMCP
site/dist/core.mjs        세션·타이머·답안 검증·채점
site/dist/concepts.mjs    핵심 개념 18개와 공식 문서 링크
site/dist/questions.json  1회 문제은행, 정답, 해설, 공식 링크
scripts/connect-github.sh GitHub 연결·커밋·푸시 보조 스크립트
tests/practice.test.mjs   문항 및 동작 검증
```

프런트엔드는 HTML/CSS/JavaScript이며 HTTP 서버는 Node 표준 라이브러리만 사용합니다. 공개 호스팅 배포는 하지 않았습니다. `site/dist`는 정적 호스팅에 올릴 수 있습니다.

개발용 문제은행에는 정답이 포함되어 있습니다. 시험 모드가 제출 전 정답을 **화면에서** 숨기더라도 개발자 도구로 JSON을 확인할 수 있습니다. 감독 시험이나 서버에서 정답을 보호해야 하는 서비스로 확장할 때는 정답·채점을 서버로 옮겨야 합니다. 현재 구현은 개인 학습용입니다.

지원 브라우저에서만 선택적 WebMCP 도구를 등록합니다. 미지원 환경에서는 일반 UI를 그대로 사용합니다. 이번 환경에서는 실제 지원 브라우저로 등록·실행을 검증하지 못했습니다.

## 검증 결과와 제한

`npm test`의 6개 검사가 통과했습니다.

1. 45개 고유 문항, 영어 번역, 7영역 배분, 선택지·해설·출처의 기본 구조
2. 답안 저장·복원, 부분 채점, 제출 후 수정 방지, 영역별 합계
3. 새로고침 후에도 유지되는 절대 종료 시각과 만료 뒤 답안 선택 방지
4. 카테고리 필터, 연습 정답 확인 후 답안 잠금, 전체 정답 채점
5. 손상되거나 버전이 다른 저장 데이터 거부
6. HTTP 요청 핸들러의 자료 제공, 파일 접근 제한, HEAD와 잘못된 요청 처리

현재 실행 환경이 로컬 소켓의 `listen`을 `EPERM`으로 차단해 실제 HTTP 포트 실행과 브라우저 화면 검증은 수행하지 못했습니다. HTTP 검사는 소켓 없이 요청 핸들러를 호출해 검증했습니다. JS 문법 검사도 통과했습니다. 실제 실행, 모바일 화면, 키보드 조작과 만료 시 화면 전환은 일반 터미널에서 서버를 실행한 뒤 추가 확인해야 합니다. SQL/PySpark 예제는 실제 Databricks 워크스페이스에서 실행 검증하지 않았습니다.

일부 추가 공식 문서 링크는 이번 환경의 네트워크 제한으로 직접 재확인하지 못했습니다. 핵심 공식 시험 범위와 Auto Loader·COPY INTO·Unity Catalog·Jobs 제어 흐름·Bundles 등의 문서는 확인했지만, 모든 외부 링크의 현재 응답 상태를 보장하지는 않습니다.

## jaemanc93 GitHub 연결

연결할 주소는 현재 폴더 이름을 기준으로 **`jaemanc93/databricks_dea`**로 준비했습니다. 저장소 생성, 원격 연결, 커밋, 푸시는 **아직 실행 완료되지 않았습니다**.

이번 환경에서는 `.git` 생성이 `Operation not permitted`로 차단되고 `github.com` DNS 접속도 실패했습니다. GitHub 플러그인은 검색되었지만 연결 안내 요청이 네트워크 차단 페이지를 반환하여 연결하지 못했습니다.

일반 터미널에서 [GitHub CLI](https://cli.github.com/) 설치 및 `jaemanc93` 로그인 후 실행하세요.

```bash
gh auth login
bash scripts/connect-github.sh
```

스크립트는 로그인 계정을 확인하고, 현재 프로젝트를 커밋한 뒤 `origin`을 연결해 main으로 푸시합니다. 저장소가 없으면 **private** 저장소를 생성합니다. 이미 다른 origin이 있으면 중단하며, 기존 원격 이력을 강제로 덮어쓰지 않습니다. 원격 main에 기존 커밋이 있으면 push가 거부될 수 있으므로 이 경우 먼저 원격 이력을 확인·통합해야 합니다.

원문 PDF는 `.gitignore`로 제외하고 로컬에 보존했습니다. 코드, 독립 제작 문항, 요약 문서와 검사만 커밋 대상으로 지정합니다. 저장소 이름을 바꾸려면 스크립트의 `repo` 값을 수정하세요.
