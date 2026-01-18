import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url, type } = await req.json(); // type: 'video' | 'audio'

    if (!url) {
      return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
    }

    // --- DEBUGGING & FALLBACK ---
    // Cek semua kemungkinan nama variabel
    const apiKey = process.env.RAPID_API_KEY || process.env.NEXT_PUBLIC_RAPID_API_KEY;
    const apiHost = process.env.RAPID_API_HOST || "youtube-media-downloader.p.rapidapi.com";

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Server Error: API Key belum dikonfigurasi. Cek .env file." 
      }, { status: 500 });
    }

    // Ekstrak ID Video
    const videoId = extractVideoId(url);
    if (!videoId) {
        throw new Error("Link YouTube tidak valid atau tidak didukung.");
    }

    // Endpoint RapidAPI
    const apiUrl = `https://${apiHost}/v2/video/details?videoId=${videoId}`;

    // Fetch ke RapidAPI
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost
      }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("RapidAPI Error Response:", errorText);
        throw new Error(`Gagal menghubungi API (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();

    // Mapping Data Berdasarkan Struktur JSON yang diberikan user
    // { errorId: "Success", title: "...", videos: { items: [...] }, audios: { items: [...] } }
    
    if (data.errorId && data.errorId !== "Success") {
       throw new Error(`API Error: ${data.errorId}`);
    }

    let finalUrl = "";
    let filename = data.title ? data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : "download";

    if (type === 'audio') {
        // Cari audio terbaik dari data.audios.items
        const audioItems = data.audios?.items || [];
        if (audioItems.length > 0) {
            // Urutkan berdasarkan sizeText (karena bitrate tidak ada di contoh, kita pakai size sebagai indikator kualitas kasar atau ambil yang pertama m4a)
            // Atau ambil item pertama karena biasanya sudah terurut atau satu-satunya
            const bestAudio = audioItems[0]; 
            finalUrl = bestAudio.url;
            filename += `.${bestAudio.extension || 'mp3'}`;
        }
    } else {
        // Cari video terbaik dari data.videos.items
        const videoItems = data.videos?.items || [];
        if (videoItems.length > 0) {
            // Cari resolusi 1080p, 720p, 480p, 360p
            const bestVideo = videoItems.find((v: any) => v.quality === "1080p") 
                           || videoItems.find((v: any) => v.quality === "720p") 
                           || videoItems.find((v: any) => v.quality === "480p")
                           || videoItems.find((v: any) => v.quality === "360p")
                           || videoItems[0];
            
            finalUrl = bestVideo.url;
            filename += `.${bestVideo.extension || 'mp4'}`;
        }
    }

    if (!finalUrl) {
        throw new Error("Tidak dapat menemukan link download. Video mungkin diprivate atau berbayar.");
    }

    return NextResponse.json({ 
      success: true, 
      url: finalUrl, 
      filename: filename
    });

  } catch (error: any) {
    console.error("Downloader Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// Helper: Ekstrak Video ID
function extractVideoId(url: string) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : null;
}