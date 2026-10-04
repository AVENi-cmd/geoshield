from pathlib import Path
import re


def sub_once(text: str, pattern: str, replacement: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Expected one match for {label}, found {count}")
    return updated


index_path = Path("index.html")
html = index_path.read_text(encoding="utf-8")

mini_html = '''        <div class="mini-services" aria-label="خدمات إضافية">
          <div class="mini-service-card">
            <span class="gs-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.5 15.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z"/><path d="M11 4v4M4 9l2.8 1.6M18 9l-2.8 1.6M17.5 4.5l-2.2 2.2M4.5 4.5l2.2 2.2"/></svg></span>
            <span class="mini-service-label">تلميع احترافي</span>
          </div>
          <div class="mini-service-card">
            <span class="gs-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 5h14l1 14H4L5 5Z"/><path d="M8 9h8M7.5 13h9M7 17h10"/></svg></span>
            <span class="mini-service-label">حماية الزجاج</span>
          </div>
          <div class="mini-service-card">
            <span class="gs-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 15h14l-1.5-5h-11L5 15Z"/><path d="M7 15v2M17 15v2M9 10l1-3h4l1 3"/><path d="M8 20h8"/></svg></span>
            <span class="mini-service-label">رش وحماية أسفل السيارة</span>
          </div>
          <div class="mini-service-card">
            <span class="gs-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4v7c0 2 1 3 3 3h5"/><path d="M8 8h5c2 0 3 1 3 3v8"/><path d="M8 19v-5M16 19v-5"/></svg></span>
            <span class="mini-service-label">التلبيس الداخلي</span>
          </div>
        </div>'''
html = sub_once(
    html,
    r'\s*<div class="mini-services">\s*<div>تلميع احترافي</div>\s*<div>حماية الزجاج</div>\s*<div>رش وحماية أسفل السيارة</div>\s*<div>التلبيس الداخلي</div>\s*</div>',
    '\n' + mini_html,
    "mini services",
)

tabs_html = '''        <div class="package-tabs" role="tablist" aria-label="فئات باقات الحماية والخدمات">
          <button class="active" type="button" role="tab" aria-selected="true" data-package="standard">حماية قياسية</button>
          <button type="button" role="tab" aria-selected="false" data-package="half">حماية نصفية</button>
          <button type="button" role="tab" aria-selected="false" data-package="full">حماية كاملة</button>
          <button type="button" role="tab" aria-selected="false" data-package="services">خدمات منفردة</button>
        </div>'''
html = sub_once(
    html,
    r'\s*<div class="package-tabs" role="tablist" aria-label="فئات باقات الحماية">.*?</div>',
    '\n' + tabs_html,
    "package tabs",
)

polish_html = '''        <div class="package-panel package-services" data-panel="services">
          <div class="polish">
            <div class="polish-copy"><span>خدمة منفردة</span><h3>تلميع كامل داخلي وخارجي</h3><p>يشمل واكس نانو مجانًا.</p></div>
            <div class="polish-price">
              <span><small>للسيارة الصغيرة</small><b>450</b></span>
              <span><small>للسيارة الكبيرة</small><b>550</b></span>
            </div>
          </div>
        </div>'''
html = sub_once(
    html,
    r'\s*<div class="polish">\s*<div><span>خدمة منفردة</span><h3>تلميع كامل داخلي وخارجي</h3><p>يشمل واكس نانو مجانًا\.</p></div>\s*<div class="polish-price"><b>450</b><small>صغير</small><b>550</b><small>كبير</small></div>\s*</div>',
    '\n' + polish_html,
    "standalone polishing",
)

old_friday = '<span>الجمعة</span><strong>٤:٠٠ - ١٠:٠٠ م</strong>'
if html.count(old_friday) != 2:
    raise SystemExit(f"Expected two Friday rows, found {html.count(old_friday)}")
html = html.replace(old_friday, '<span>الجمعة</span><strong>٤:٠٠ م - ١٠:٠٠ م</strong>')

css_link = '  <link rel="stylesheet" href="review-fixes.css">\n'
if 'href="review-fixes.css"' not in html:
    anchor = '  <link rel="stylesheet" href="refinements.css">\n'
    if anchor not in html:
        raise SystemExit("refinements.css link not found")
    html = html.replace(anchor, anchor + css_link, 1)

index_path.write_text(html, encoding="utf-8")

readme_path = Path("README.md")
readme = readme_path.read_text(encoding="utf-8").replace("٤:٠٠ - ١٠:٠٠ م", "٤:٠٠ م - ١٠:٠٠ م")
readme_path.write_text(readme, encoding="utf-8")

quality_path = Path(".github/workflows/site-quality.yml")
quality = quality_path.read_text(encoding="utf-8")
quality = quality.replace(
    "'index.html', 'style.css', 'enhancements.css', 'refinements.css', 'script.js',",
    "'index.html', 'style.css', 'enhancements.css', 'refinements.css', 'review-fixes.css', 'script.js',",
)
quality = quality.replace(
    "html.count('<span>الجمعة</span><strong>٤:٠٠ - ١٠:٠٠ م</strong>') == 2",
    "html.count('<span>الجمعة</span><strong>٤:٠٠ م - ١٠:٠٠ م</strong>') == 2",
)
quality = quality.replace(
    "'Friday README hours': '| الجمعة | ٤:٠٠ - ١٠:٠٠ م | — |' in readme,",
    "'Friday README hours': '| الجمعة | ٤:٠٠ م - ١٠:٠٠ م | — |' in readme,",
)
quality = quality.replace(
    "'Refinement stylesheet linked': '<link rel=\"stylesheet\" href=\"refinements.css\">' in html,",
    "'Refinement stylesheet linked': '<link rel=\"stylesheet\" href=\"refinements.css\">' in html and '<link rel=\"stylesheet\" href=\"review-fixes.css\">' in html,",
)
quality = quality.replace(
    "polish_pattern = r'<div class=\"polish-price\"><b>450</b><small>صغير</small><b>550</b><small>كبير</small></div>'",
    "polish_pattern = r'<div class=\"polish-price\">.*?<small>للسيارة الصغيرة</small><b>450</b>.*?<small>للسيارة الكبيرة</small><b>550</b>.*?</div>'",
)
anchor = "              'Aftercare heading present': 'توصيات ما بعد التركيب' in html,\n"
extra = "              'Standalone services package tab': 'data-package=\"services\">خدمات منفردة</button>' in html and 'data-panel=\"services\"' in html,\n"
if extra not in quality:
    if anchor not in quality:
        raise SystemExit("Quality-check insertion anchor missing")
    quality = quality.replace(anchor, anchor + extra, 1)
quality_path.write_text(quality, encoding="utf-8")

print("Approved review fixes applied.")
