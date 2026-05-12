# Victor Lab TODO

## 완료

1. **Favicon** — `/favicon.svg`(amber 그라디언트 V) 적용
   - `index.html`, `service/`, `app/`, `okinawa/` ✓
   - `auto/*.html` 누락
2. **Smooth scroll (Lenis)** + **TOP 버튼**
   - `index.html`, `okinawa/index.html` ✓
   - `service/`, `app/`, `auto/*.html` 누락
3. **데이터·자동화 샘플 섹션 (index.html)**
   - PC 3-column 정렬로 통일 (Demo 3 col-span 제거)
   - Demo 2(크롤링), Demo 3(DART) 썸네일을 `400×300 base + ResizeObserver scale` 패턴으로 변환
   - 내부 카드 폰트/패딩을 Demo 1(엑셀) 톤(~8–10px)에 맞춰 축소
   - Demo 2 카드 4개(당근/쿠팡/중고나라/당근), Demo 3 카드 3개(나라장터/DART/나라장터)

## 완료 (2026-05-09)

4. **하위 페이지 인터랙션 일관성** ✓
   - `service/index.html`, `app/index.html`에 Lenis smooth scroll + TOP 버튼 이식
   - `auto/crawl.html`, `auto/dart.html`, `auto/excel.html`에 favicon + Lenis + TOP 버튼 이식

5. **환불정책 사이트 통합** ✓
   - `policies/refund.md` (회당 추가 수정비 5만원 확정), `policies/refund.html` (정책 전문 페이지 신규), `policies/refund_summary.md`, `policies/kakao_response_template.md` (카톡 응대 5종)
   - `index.html` FAQ에 환불 3문항 + 정책 전문 링크 통합

6. **사이트 이전: lab → income/order** ✓
   - `okum`, `halden_studio`, `numen`, `tempo_society`를 `income/order/YYMMDD_이름` 형식으로 이전
   - `lab/` 안에는 절대경로 심볼릭 링크로 유지, 모든 `/okum`, `/halden_studio` 등 링크 200 검증

---
기록일: 2026-05-07 / 갱신: 2026-05-09
