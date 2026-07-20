import os

def search_text(root_dir):
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules and .git
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '.dart_tool', 'build')]
        for file in files:
            if file.endswith(('.html', '.js', '.dart', '.css', '.py')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        for i, line in enumerate(f):
                            if '??">' in line or '?>' in line or '\">' in line or '??' in line:
                                print(f"{path}:{i+1} -> {line.strip()}")
                except UnicodeDecodeError:
                    pass

search_text('c:/Users/win/Desktop/smart_idea')
