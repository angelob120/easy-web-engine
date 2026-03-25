/**
 * CONTENT FACTORY - Video Generator
 * Creates videos from canvas with motion effects
 */

const VideoGenerator = {
  // Generate video from a variation with motion effects
  async generateVideo(variation, duration = 5) {
    const canvas = document.getElementById('render-canvas');
    const ctx = canvas.getContext('2d');
    
    // Get the static frame first
    const template = FORMAT_TEMPLATES.find(t => t.id === variation.templateId);
    await TemplateRenderer.renderToCanvas(template, variation.content, variation.assets);
    
    // Create a copy of the static image
    const staticImage = new Image();
    await new Promise(resolve => {
      staticImage.onload = resolve;
      staticImage.src = canvas.toDataURL('image/png');
    });

    // Set up recording
    const fps = 30;
    const totalFrames = duration * fps;
    const motionType = variation.motion || template.defaultMotion;

    // Try to use MediaRecorder for video
    try {
      return await this.recordWithMediaRecorder(canvas, ctx, staticImage, motionType, duration, fps);
    } catch (e) {
      console.log('MediaRecorder failed, using GIF fallback:', e);
      return await this.createAnimatedFallback(canvas, ctx, staticImage, motionType, duration, fps);
    }
  },

  async recordWithMediaRecorder(canvas, ctx, staticImage, motionType, duration, fps) {
    return new Promise((resolve, reject) => {
      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 5000000
      });

      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      recorder.onerror = reject;

      recorder.start();

      // Animate frames
      const totalFrames = duration * fps;
      let frame = 0;

      const animate = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const progress = frame / totalFrames;
        this.renderFrameWithMotion(ctx, staticImage, motionType, progress, canvas.width, canvas.height);
        frame++;

        setTimeout(animate, 1000 / fps);
      };

      animate();
    });
  },

  // Render a single frame with motion applied
  renderFrameWithMotion(ctx, image, motionType, progress, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Easing function for smooth motion
    const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const p = ease(progress);

    switch (motionType) {
      case MOTION_EFFECTS.ZOOM_IN:
        // Start at 100%, end at 108%
        const scaleIn = 1 + (0.08 * p);
        const offsetInX = (w * (scaleIn - 1)) / 2;
        const offsetInY = (h * (scaleIn - 1)) / 2;
        ctx.drawImage(image, -offsetInX, -offsetInY, w * scaleIn, h * scaleIn);
        break;

      case MOTION_EFFECTS.ZOOM_OUT:
        // Start at 108%, end at 100%
        const scaleOut = 1.08 - (0.08 * p);
        const offsetOutX = (w * (scaleOut - 1)) / 2;
        const offsetOutY = (h * (scaleOut - 1)) / 2;
        ctx.drawImage(image, -offsetOutX, -offsetOutY, w * scaleOut, h * scaleOut);
        break;

      case MOTION_EFFECTS.PAN_LEFT:
        // Pan from right to center
        const panLeftX = w * 0.05 * (1 - p);
        ctx.drawImage(image, -panLeftX, 0, w * 1.05, h * 1.05);
        break;

      case MOTION_EFFECTS.PAN_RIGHT:
        // Pan from left to center
        const panRightX = -w * 0.05 * (1 - p);
        ctx.drawImage(image, -panRightX - w * 0.05, 0, w * 1.05, h * 1.05);
        break;

      case MOTION_EFFECTS.PAN_UP:
        // Pan from bottom to center
        const panUpY = h * 0.05 * (1 - p);
        ctx.drawImage(image, 0, -panUpY, w * 1.02, h * 1.05);
        break;

      case MOTION_EFFECTS.PAN_DOWN:
        // Pan from top to center
        const panDownY = -h * 0.05 * (1 - p);
        ctx.drawImage(image, 0, -panDownY - h * 0.05, w * 1.02, h * 1.05);
        break;

      case MOTION_EFFECTS.PARALLAX:
        // Subtle multi-layer effect (simplified for single image)
        const parallaxScale = 1 + (0.03 * p);
        const parallaxX = w * 0.02 * Math.sin(p * Math.PI);
        ctx.drawImage(image, -parallaxX, 0, w * parallaxScale, h * parallaxScale);
        break;

      case MOTION_EFFECTS.FADE_IN:
        // Fade in with subtle scale
        ctx.globalAlpha = Math.min(1, p * 1.5);
        const fadeScale = 0.98 + (0.02 * p);
        const fadeOffsetX = (w * (1 - fadeScale)) / 2;
        const fadeOffsetY = (h * (1 - fadeScale)) / 2;
        ctx.drawImage(image, fadeOffsetX, fadeOffsetY, w * fadeScale, h * fadeScale);
        break;

      case MOTION_EFFECTS.SCALE_BOUNCE:
        // Start slightly small, bounce to full
        let bounceScale;
        if (p < 0.3) {
          bounceScale = 0.95 + (0.08 * (p / 0.3));
        } else if (p < 0.5) {
          bounceScale = 1.03 - (0.03 * ((p - 0.3) / 0.2));
        } else {
          bounceScale = 1;
        }
        const bounceOffsetX = (w * (bounceScale - 1)) / 2;
        const bounceOffsetY = (h * (bounceScale - 1)) / 2;
        ctx.drawImage(image, -bounceOffsetX, -bounceOffsetY, w * bounceScale, h * bounceScale);
        break;

      default:
        // Default: subtle zoom
        const defaultScale = 1 + (0.05 * p);
        const defaultOffsetX = (w * (defaultScale - 1)) / 2;
        const defaultOffsetY = (h * (defaultScale - 1)) / 2;
        ctx.drawImage(image, -defaultOffsetX, -defaultOffsetY, w * defaultScale, h * defaultScale);
    }

    ctx.restore();
  },

  // Fallback: Create animated content using static image with CSS animation info
  async createAnimatedFallback(canvas, ctx, staticImage, motionType, duration, fps) {
    // For browsers that don't support MediaRecorder well,
    // return the static image as a blob with animation metadata
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        // Attach animation metadata
        blob.animationData = {
          type: motionType,
          duration: duration
        };
        resolve(blob);
      }, 'image/png');
    });
  },

  // Batch generate videos for export queue
  async batchGenerate(variations, onProgress) {
    const results = [];
    
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      
      try {
        const videoBlob = await this.generateVideo(variation, variation.duration || 5);
        results.push({
          variation,
          blob: videoBlob,
          success: true
        });
      } catch (e) {
        console.error('Failed to generate video:', e);
        results.push({
          variation,
          blob: null,
          success: false,
          error: e.message
        });
      }

      if (onProgress) {
        onProgress((i + 1) / variations.length, i + 1, variations.length);
      }
    }

    return results;
  }
};

// Export helper functions
const ExportHelper = {
  // Create ZIP file with all videos
  async createExportZip(results, onProgress) {
    const zip = new JSZip();
    const videoFolder = zip.folder('videos');
    
    let captionsTxt = 'CONTENT FACTORY - VIDEO CAPTIONS\n';
    captionsTxt += '================================\n\n';
    captionsTxt += `Generated: ${new Date().toISOString()}\n`;
    captionsTxt += `Total videos: ${results.filter(r => r.success).length}\n\n`;

    results.forEach((result, i) => {
      if (!result.success || !result.blob) return;

      const variation = result.variation;
      const template = FORMAT_TEMPLATES.find(t => t.id === variation.templateId);
      const filename = `${String(i + 1).padStart(3, '0')}-${template.id}-${Date.now()}.webm`;

      videoFolder.file(filename, result.blob);

      // Add caption
      captionsTxt += `--- ${filename} ---\n`;
      captionsTxt += `Template: ${template.name}\n`;
      captionsTxt += `Duration: ${variation.duration || 5}s\n`;
      captionsTxt += `Motion: ${variation.motion || template.defaultMotion}\n`;
      
      // Add content text
      if (variation.content) {
        Object.entries(variation.content).forEach(([key, value]) => {
          if (value) captionsTxt += `${key}: ${value}\n`;
        });
      }
      captionsTxt += '\n';
    });

    // Add captions file
    zip.file('captions.txt', captionsTxt);

    // Add readme
    const readme = `CONTENT FACTORY VIDEO PACK
==========================

This ZIP contains ${results.filter(r => r.success).length} videos ready to upload:
- TikTok ✓
- YouTube Shorts ✓
- Instagram Reels ✓
- Facebook Reels ✓

FORMAT: 1080x1920 pixels (9:16 vertical)
FORMAT: WebM (VP8 codec)

⚠️ IMPORTANT FOR MAC USERS:
QuickTime cannot play WebM files. To preview videos:
- Use VLC Player (free): https://www.videolan.org/vlc/
- Or drag into Chrome browser to play
- Or just upload directly - all platforms accept WebM!

HOW TO CONVERT TO MP4 (optional):
- Use CloudConvert.com (free, online)
- Or HandBrake (free desktop app)

Generated by Content Factory
`;
    zip.file('README.txt', readme);

    // Generate ZIP
    const content = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    }, (metadata) => {
      if (onProgress) {
        onProgress(metadata.percent / 100);
      }
    });

    return content;
  },

  // Download a single video
  async downloadSingle(variation) {
    const blob = await VideoGenerator.generateVideo(variation, variation.duration || 5);
    const template = FORMAT_TEMPLATES.find(t => t.id === variation.templateId);
    const filename = `${template.id}-${Date.now()}.webm`;
    
    saveAs(blob, filename);
  }
};
