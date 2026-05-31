#!/usr/bin/env bash
# Victor Lab 갱신 헬퍼
# 실제로 바뀐 콘텐츠 파일에 한해 sitemap lastmod 를 오늘 날짜로 맞추고,
# 커밋 메시지와 함께 origin/main 으로 푸시한다.
#
#   사용법:  ./refresh.sh "커밋 메시지"
#   메시지 생략 시 변경 파일 목록으로 자동 생성.
#
# 빈 커밋은 만들지 않는다 — 변경이 없으면 그냥 종료한다.

set -euo pipefail
cd "$(dirname "$0")"

TODAY="$(date +%F)"

# sitemap URL ↔ 파일 매핑
declare -A MAP=(
  ["index.html"]="https://lab.victor-jk.com/"
  ["policies/refund.html"]="https://lab.victor-jk.com/policies/refund.html"
)

# 워킹트리에서 (스테이징 포함) 변경된 추적 파일 목록
changed="$(git status --porcelain | awk '{print $2}')"

if [ -z "$changed" ]; then
  echo "변경 사항 없음 — 종료."
  exit 0
fi

# 변경된 파일에 대응하는 sitemap lastmod 갱신
for file in "${!MAP[@]}"; do
  if grep -qx "$file" <<<"$changed"; then
    loc="${MAP[$file]}"
    # 해당 <loc> 블록의 <lastmod> 만 오늘 날짜로 교체
    awk -v loc="$loc" -v today="$TODAY" '
      $0 ~ "<loc>" loc "</loc>" { inblock=1 }
      inblock && /<lastmod>/ {
        sub(/<lastmod>[^<]*<\/lastmod>/, "<lastmod>" today "</lastmod>")
        inblock=0
      }
      { print }
    ' sitemap.xml > sitemap.xml.tmp && mv sitemap.xml.tmp sitemap.xml
    echo "sitemap lastmod 갱신: $loc → $TODAY"
  fi
done

git add -A

# 커밋 메시지
if [ "$#" -ge 1 ] && [ -n "$1" ]; then
  MSG="$1"
else
  files="$(git diff --cached --name-only | paste -sd ', ' -)"
  MSG="Update site content ($files)"
fi

git commit -m "$MSG

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin main
echo "푸시 완료."
