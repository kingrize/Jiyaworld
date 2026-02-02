import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faHistory, faPlay } from '@fortawesome/free-solid-svg-icons'
import SEO from '../components/SEO'

const HistoryPage = () => {
    const [historyList, setHistoryList] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = () => {
        try {
            const storedHistory = localStorage.getItem('comicHistory')
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory)
                const sortedHistory = Object.entries(parsedHistory)
                    .map(([slug, data]) => ({ slug, ...data }))
                    .sort((a, b) => new Date(b.readDate) - new Date(a.readDate))
                
                setHistoryList(sortedHistory)
            }
        } catch (e) {
            console.error("Gagal memuat riwayat", e)
        }
    }

    const clearHistory = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat bacaan?')) {
            localStorage.removeItem('comicHistory')
            setHistoryList([])
        }
    }

    const handleComicClick = (item) => {
        navigate(`/detail-comic/${item.slug}`, {
            state: item.comicDataForDetail
        })
    }

    const handleContinueReading = (e, item) => {
        e.stopPropagation() 
        navigate(`/read-comic/${item.slug}/${item.lastChapterSlug}`, {
            state: {
                chapterLink: item.lastChapterLink,
                comicTitle: item.title,
                chapterNumber: item.lastChapter,
                comicDetailState: item.comicDataForDetail
            }
        })
    }

    return (
        <>
            <SEO
                title="Riwayat Bacaan"
                description="Daftar komik yang pernah Anda baca di Kanata-Toon."
                url="https://juju-manhwa-2-0.vercel.app/history"
            />
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                                <FontAwesomeIcon icon={faHistory} className="text-purple-500" />
                                Riwayat Bacaan
                            </h2>
                        </div>
                        
                        {historyList.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-semibold"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Hapus Riwayat
                            </button>
                        )}
                    </div>
                    {historyList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faHistory} className="text-4xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum ada riwayat</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                                Anda belum membaca komik apapun. Mulailah membaca untuk menyimpan riwayat Anda di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {historyList.map((item, index) => (
                                <div
                                    key={`${item.slug}-${index}`}
                                    onClick={() => handleComicClick(item)}
                                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex"
                                >

                                    <div className="w-32 h-48 flex-shrink-0 relative overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/150x225?text=No+Cover'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>

                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Terakhir dibaca:
                                            </p>
                                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                Chapter {item.lastChapter}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(item.readDate).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                        <button
                                            onClick={(e) => handleContinueReading(e, item)}
                                            className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <FontAwesomeIcon icon={faPlay} />
                                            Lanjut Baca
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default HistoryPage