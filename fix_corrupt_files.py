"""Fix corrupted PostCard.tsx and create/page.tsx by truncating duplicate trailing junk."""
import os

base = os.path.dirname(os.path.abspath(__file__))

fixes = [
    {
        "path": os.path.join(base, "your-trip-web", "src", "components", "features", "PostCard.tsx"),
        "keep_lines": 522,
    },
    {
        "path": os.path.join(base, "your-trip-web", "src", "app", "create", "page.tsx"),
        "keep_lines": 418,
    },
]

for fix in fixes:
    path = fix["path"]
    keep = fix["keep_lines"]
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    total = len(lines)
    # Strip CRLF -> LF
    lines = [l.rstrip("\r\n") + "\n" for l in lines]
    trimmed = lines[:keep]
    # Ensure file ends with single newline
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.writelines(trimmed)
    print(f"Fixed: {os.path.basename(path)} ({total} -> {keep} lines)")

print("\nDone! Now run:")
print("  git add your-trip-web/src/components/features/PostCard.tsx")
print("  git add your-trip-web/src/app/create/page.tsx")
print('  git commit -m "Day 20: fix: truncate corrupt trailing junk from PostCard + create page"')
print("  git push github main")
