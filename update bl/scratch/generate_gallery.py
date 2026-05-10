import os

frames_dir = r"d:\update bl\bank abb latest bl\till uco 1\scratch\frames"
html_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\view_frames.html"

if os.path.exists(frames_dir):
    files = sorted([f for f in os.listdir(frames_dir) if f.endswith(".jpg")])
    
    html_content = """<!DOCTYPE html>
<html>
<head>
    <title>Video Frames Gallery</title>
    <style>
        body { font-family: sans-serif; background-color: #121212; color: #ffffff; padding: 20px; }
        h1 { text-align: center; color: #bb86fc; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .card { background-color: #1e1e1e; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid #333; }
        .card img { width: 100%; height: auto; display: block; }
        .card-info { padding: 10px; text-align: center; font-weight: bold; background-color: #272727; color: #03dac6; }
    </style>
</head>
<body>
    <h1>Video Frames Gallery (Every 2 Seconds)</h1>
    <div class="gallery">
"""
    # Let's take every 5th frame for a quick overview (every 10 seconds) so the page is not too heavy,
    # or let's include all of them but lazy load, or let's include all of them and scroll.
    # To keep the page responsive and easy to analyze, let's include frames every 10 seconds for the overview,
    # and provide a way to see details. Or actually, let's write a script that helps us see frames at specific intervals.
    for i, file in enumerate(files):
        # file format: frame_000s.jpg, frame_002s.jpg, etc.
        sec = int(file.replace("frame_", "").replace("s.jpg", ""))
        # Only show every 10 seconds in the HTML to avoid freezing the browser, but keep all on disk
        if sec % 10 == 0:
            html_content += f"""
        <div class="card">
            <img src="frames/{file}" alt="{file}">
            <div class="card-info">{sec} Seconds ({sec//60}m {sec%60}s)</div>
        </div>"""
            
    html_content += """
    </div>
</body>
</html>
"""
    with open(html_path, "w") as f:
        f.write(html_content)
    print(f"Gallery HTML generated successfully at {html_path}")
else:
    print("Frames directory does not exist.")
