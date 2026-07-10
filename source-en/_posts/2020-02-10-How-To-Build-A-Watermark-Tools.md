---
layout: post
title: The "Small" Matter of Watermarks
categories: Security Engineer
kerywords: watermark tools
tags: security development tools
translated: true
---

# What I've Already Done

Let me talk about watermarks. I hadn't really touched this in my actual job, and since I happened to be between gigs, I threw together a little tool called [Wwmark](https://github.com/mylamour/Wwmark) (What Watermark) — nothing fancy, but it gets the job done. A watermark, as the name suggests, is a mark added to something — like water on paper — without affecting the usability of the original file. Broadly, watermarks fall into a few categories: image watermarks, video watermarks, document watermarks, and web page watermarks. The watermark itself can be either an image or text. And depending on whether it's visible, you can split them into visible watermarks and blind watermarks. Blind watermarks are related to steganography you see in CTF challenges, but not exactly the same thing.

I'll skip the whole RGBA vs RGB rabbit hole for now (PIL and OpenCV store images differently, which gets fun), and just walk through what I actually built. Since the inputs are videos and documents, the tech stack basically picked itself: FFMPEG and OpenCV. FFMPEG handles the visible watermarking for images and video. Sure, you could just use the command line and be done with it, but that's not exactly reusable.

```bash
ffmpeg -i input.mp4 -i image.png -filter_complex "[0:v][1:v] overlay=x=10:y=10" -c:a copy output.mp4
```

For text watermarks vs image watermarks, FFMPEG gives you `drawtext` and `overlay` respectively.

Over in [wwmark.py](https://github.com/mylamour/Wwmark/blob/master/wwmark.py), I wrapped all this up (on top of ffmpeg-python) so it supports both visible and blind watermarks across different file types. For PDFs, the approach is: convert to images with pdf2image, add the watermark, then stitch everything back into a PDF.

A few gotchas I ran into:

First, file paths — use `tempfile.TemporaryDirectory()`, trust me.

Second, the generated filenames need sorting. The default used `uuid.uuid1()` for filenames, which causes ordering problems when you go to reassemble the PDF. Simple fix: swap it out for a `lambda x: x+1` incrementing counter.

Third, when stitching images back into a PDF, you end up with an extra blank first page. That's because of ` ims[0].save(self.o_file, "PDF", resolution=100.0, save_all=True, append_images=ims[1:])` — the fix is to make sure `append_images` starts from the second image.

One more thing about writing watermarks: when processing images, standardize on a single format. Just convert everything to PNG on input and output as PNG. Different files have different channel layouts and it'll bite you.

```python
        with tempfile.TemporaryDirectory() as temp:
            # Original uuid generator is not sortable
            convert_from_path(self.i_file, output_folder=temp,
                              thread_count=1, output_file=lambda x: x+1)
            for item in sorted(os.listdir(temp)):
                self.i_file = os.path.join(temp, item)
                it = os.path.join(temp, "{}.png".format(item))

                if mark == "text":
                    self.text(path=it)

                if mark == "image":
                    self.image(path=it)

                with open(it, 'rb') as f:
                    im = Image.open(f)
                    im.load()
                    ims.append(im.convert('RGB'))

        ims[0].save(self.o_file, "PDF", resolution=100.0,
                    save_all=True, append_images=ims[1:])
```

Also worth noting: FFMPEG defaults overwrite to false. When using it as an ffmpeg-python library and you set output to quiet, the program will just error out silently and you'll have no idea why. Force it to true.

Some test results:

Original: ![guest](https://img.iami.xyz/images/74144461-b9108000-4c37-11ea-964f-0dd80ebc2761.jpg)

Watermarked:
![wm](https://img.iami.xyz/images/74144472-bf9ef780-4c37-11ea-9d67-2ab74e1ee7c7.png)

Blind watermark applied:
![wi_guest_blind](https://img.iami.xyz/images/74144454-b4e46280-4c37-11ea-8eef-6c86a1af9b46.png)

Extracted watermark:
![wm_show](https://img.iami.xyz/images/74144503-ce85aa00-4c37-11ea-875f-d3a2106fa9c5.png)

For visible watermarks, since it's done with FFMPEG overlay, positioning is entirely controlled by how you write the overlay filter. The basic options are `x` and `y` coordinates. You can also use `enable=between(t, xxxx,yyy)` to repeat frames at specific intervals in a video.

For image transparency, it's not as straightforward as `drawtext` where you can just set `alpha=0.4` (where 0.4 means 40% opacity). With images you need to use `colorchannelmixer` and control the `aa` value.

Here's what 40% transparency looks like:
![jjjjjjjjj](https://img.iami.xyz/images/74206390-27942300-4cb6-11ea-91a5-0c98b22ae27a.png)

# The Ideal Version

Multi-format support, multiple watermark options, proper data classification and access control, plus logging and tracing. Ideally: auto-injection and one-click audit trail. That's the dream.

![image](https://img.iami.xyz/images/74119770-d7588a80-4bfb-11ea-88ec-ced701034f37.png)


# Reality

Some complaints I've heard from people in the field:

* Different teams integrate it differently, so the results are inconsistent
* Post-integration data collection is set up wrong, so again, results are off
* During audit/tracing, the data doesn't line up — because the integration was wrong
* During audit/tracing, permissions and environment access are a nightmare — still because the integration was wrong
