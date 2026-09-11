import re

# ── 1. Remove chatbot CSS from styles.css ──────────────────────────────────
css_path = r'c:\Users\avsss\Desktop\smae\styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

css2 = re.sub(
    r'/\* =+\s*Chatbot Widget Styles.*?/\* Other existing mobile rules \*/\s*\.blueprint-container \{ \}\s*',
    '',
    css,
    flags=re.DOTALL
)
if css2 != css:
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css2)
    print('Chatbot CSS removed from styles.css')
else:
    print('CSS pattern not matched, trying alternate...')
    # Fallback: remove from the chatbot section header to end of file chatbot block
    css2 = re.sub(
        r'\n/\* ={5,}\s*\n\s*Chatbot Widget Styles.*',
        '',
        css,
        flags=re.DOTALL
    )
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css2)
    print('Chatbot CSS removed (fallback) from styles.css')

# ── 2. Remove chatbot JS from script.js ───────────────────────────────────
js_path = r'c:\Users\avsss\Desktop\smae\script.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

js2 = re.sub(
    r'/\*\*\s*\n \* Chatbot Implementation\s*\n \*/\s*\ndocument\.addEventListener.*?(?=\n// Instagram Widget|\n/\* ={5,}|\Z)',
    '',
    js,
    flags=re.DOTALL
)
if js2 != js:
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js2)
    print('Chatbot JS removed from script.js')
else:
    print('JS pattern not matched')
