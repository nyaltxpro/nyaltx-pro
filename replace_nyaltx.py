import pathlib, sys, re

def replace_in_file(path: pathlib.Path):
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        # skip binary files
        return
    if 'nyaltx.pro' in text:
        new_text = text.replace('nyaltx.pro', 'nyaltx.pro')
        path.write_text(new_text, encoding='utf-8')
        print(f'Replaced in {path}')

def main():
    root = pathlib.Path('.')
    for ext in ['.ts', '.tsx', '.js', '.json', '.md', '.html', '.css', '.scss']:
        for path in root.rglob(f'*{ext}'):
            replace_in_file(path)

if __name__ == '__main__':
    main()
