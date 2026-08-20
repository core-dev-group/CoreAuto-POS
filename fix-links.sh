#!/bin/bash
# Replace Link with LinkWithLoading across pages
find src/app/\(dashboard\) -name "page.tsx" | while read -r file; do
  if grep -q "import Link from \"next/link\"" "$file"; then
    # Calculate relative path to components
    depth=$(echo "$file" | tr -cd '/' | wc -c)
    rel=""
    for ((i=3; i<depth; i++)); do rel="../$rel"; done
    
    # Replace import
    sed -i "s|import Link from \"next/link\";|import { LinkWithLoading as Link } from \"@/components/LinkWithLoading\";|g" "$file"
  fi
done
