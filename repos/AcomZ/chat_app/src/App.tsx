import React, { useState, useEffect, useCallback } from 'react';
import { AppProviders, useSSO, useLang, pb } from '@startup/shared-ui';

function LocationGuard({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Approximate bounding box for Saudi Arabia
          // Latitude: 16° to 32°, Longitude: 34° to 56°
          const inSA = lat >= 16.0 && lat <= 32.5 && lng >= 34.0 && lng <= 56.0;
          setIsAllowed(inSA);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // If location is blocked or fails, deny access
          setIsAllowed(false);
        }
      );
    } else {
      setIsAllowed(false);
    }
  }, []);

  if (isAllowed === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <h2>{isAr ? 'جاري التحقق من الموقع...' : 'Checking location...'}</h2>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📍</h1>
        <h2 style={{ marginBottom: '1rem' }}>
          {isAr ? 'عذراً، التطبيق متاح في المملكة العربية السعودية فقط' : 'Sorry, this app is only available in Saudi Arabia'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isAr ? 'يبدو أنك تحاول الوصول للتطبيق من خارج النطاق الجغرافي المسموح به أو لم تمنح صلاحية الموقع.' : 'It looks like you are outside the allowed geographical area or denied location access.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '20px' }}
        >
          {isAr ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

const HUDHUD_COLORS = ['var(--hudhud-orange)', 'var(--hudhud-blue)', 'var(--hudhud-red)', 'var(--hudhud-green)', 'var(--hudhud-purple)', 'var(--hudhud-yellow)'];

type Comment = {
  id: number;
  text: string;
  userName: string;
  userKarma: number;
  banVotes: number;
};

type Post = {
  id: number;
  userName: string;
  userKarma: number;
  text: string;
  color: string;
  votes: number;
  userVote: number;
  comments: Comment[];
  time: string;
  distance: string;
  imageUrl: string | null;
  imageCaption: string | null;
  voiceUrl: string | null;
  banVotes: number;
};

const DUMMY_POSTS: Post[] = [
  { id: 1, userName: "مواطن", userKarma: 150, text: "أحد يعرف مقهى ممتاز في العليا؟", color: HUDHUD_COLORS[0], votes: 12, userVote: 0, comments: [{id: 101, text: "جرب درافت كافيه!", userName: "عاشق القهوة", userKarma: 42, banVotes: 0}], time: "5د", distance: "هنا", imageUrl: null, imageCaption: null, voiceUrl: null, banVotes: 0 },
  { id: 2, userName: "مستثمر", userKarma: 320, text: "أخيراً حصلت على أرضي الأولى في تطبيق خريطة الرياض! متحمس جداً لوضع إعلاني 🚀", color: HUDHUD_COLORS[1], votes: 45, userVote: 0, comments: [], time: "1س", distance: "قريب جداً", imageUrl: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366", imageCaption: "مستوى جديد!", voiceUrl: null, banVotes: 0 },
  { id: 3, userName: "موسيقي", userKarma: -5, text: "اسمعوا هذا الإيقاع الجديد اللي سويته 🎧", color: HUDHUD_COLORS[2], votes: 89, userVote: 0, comments: [], time: "2س", distance: "قريب", imageUrl: null, imageCaption: null, voiceUrl: "dummy_audio.mp3", banVotes: 0 },
  { id: 4, userName: "رحال", userKarma: 800, text: "موسم الرياض يبدو رائعاً!", color: HUDHUD_COLORS[3], votes: 120, userVote: 0, comments: [], time: "3س", distance: "بعيد", imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809", imageCaption: "ليلة جميلة", voiceUrl: null, banVotes: 0 },
  { id: 5, userName: "تاريخي", userKarma: 45, text: "لقيت هذا المكان المخفي في الدرعية", color: HUDHUD_COLORS[4], votes: 34, userVote: 0, comments: [], time: "4س", distance: "بعيد", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded", imageCaption: "أجواء تاريخية", voiceUrl: null, banVotes: 0 },
  { id: 6, userName: "مصور", userKarma: 999, text: "غروب الشمس من نهاية العالم!", color: HUDHUD_COLORS[5], votes: 210, userVote: 0, comments: [], time: "5س", distance: "بعيد جداً", imageUrl: "https://images.unsplash.com/photo-1621252179027-9c027cb6bfa7", imageCaption: "بدون كلمات", voiceUrl: null, banVotes: 0 },
];

const MOCK_SETTINGS = { modThreshold: 50 };

// --- Compact Custom Header for Mobile ---
function ChatHeader() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--header-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src="/hudhud.png" alt="Icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
        <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>{isAr ? 'هدهد شات' : 'HUDHUD CHAT'}</h1>
      </div>
      <a href="/" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>{isAr ? 'العودة' : 'Back'}</a>
    </div>
  );
}

// --- TikTok Style Image Swiper ---
function ImageSwiper({ posts, startIndex, onClose }: { posts: Post[], startIndex: number, onClose: () => void }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [touchStart, setTouchStart] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    if (touchStart - touchEnd > 50 && currentIndex < posts.length - 1) {
      setCurrentIndex(curr => curr + 1); // Swipe Up -> Next
    } else if (touchEnd - touchStart > 50 && currentIndex > 0) {
      setCurrentIndex(curr => curr - 1); // Swipe Down -> Prev
    }
  };

  const post = posts[currentIndex];

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column', touchAction: 'none' }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
    >
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '1rem', backdropFilter: 'blur(10px)' }}>{isAr ? 'إغلاق ✕' : 'Close ✕'}</button>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={post.imageUrl!} alt="Feed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Overlays */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
          <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{post.text}</p>
          {post.imageCaption && <p style={{ color: 'var(--hudhud-green)', fontSize: '1rem', margin: 0 }}>{post.imageCaption}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', color: 'white' }}>
            <span>❤️ {post.votes}</span>
            <span>💬 {post.comments.length}</span>
            <span>📍 {post.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Post Card Component ---
function PostCard({ post, onVote, onReport, onDelete, isMod, onClick, onImageClick }: { post: Post, onVote: (id: number, val: number) => void, onReport: (e: React.MouseEvent) => void, onDelete: (id: number) => void, isMod: boolean, onClick: () => void, onImageClick: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const isImage = !!post.imageUrl;
  const isVoice = !!post.voiceUrl;

  const handleVoteClick = (e: React.MouseEvent, val: number) => {
    e.stopPropagation();
    onVote(post.id, val);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm(isAr ? 'حذف هذا المنشور كمشرف؟' : 'Delete this post as moderator?')) onDelete(post.id);
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleCardClick = () => {
    if (isImage) {
      onImageClick();
    } else {
      onClick();
    }
  };

  return (
    <div 
      className="hudhud-card" 
      onClick={handleCardClick}
      style={{ 
        background: isImage ? 'transparent' : post.color, 
        minHeight: isImage ? '350px' : 'auto',
        position: 'relative', overflow: 'hidden', cursor: 'pointer', padding: 0 
      }}
    >
      {isImage && (
        <>
          <img src={post.imageUrl!} alt="Post content" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%)', zIndex: 1 }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 2, padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
          <div style={{ flex: 1 }}>
            {post.text && (
              <p style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.4, margin: '0 0 1rem 0', textShadow: isImage ? '0 2px 4px rgba(0,0,0,0.8)' : 'none' }}>
                {post.text}
              </p>
            )}

            {isVoice && (
              <div onClick={handleTogglePlay} style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1.5rem', borderRadius: '30px', marginTop: '0.5rem', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  {isPlaying ? '⏸' : '▶'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {isPlaying ? (isAr ? 'جاري التشغيل...' : 'Playing...') : (isAr ? 'اضغط للاستماع' : 'Tap to listen')}
                </div>
              </div>
            )}

            {isMod && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleDeleteClick} style={{ background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isAr ? '🗑️ حذف' : '🗑️ Delete'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); alert('تم اقتراح الحظر. الأصوات الحالية: ' + post.banVotes + '/3'); }} style={{ background: 'rgba(255,165,0,0.8)', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isAr ? '🔨 حظر' : '🔨 Ban'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: isImage ? 'rgba(0,0,0,0.4)' : 'transparent', padding: isImage ? '0.5rem' : '0', borderRadius: '20px', backdropFilter: isImage ? 'blur(10px)' : 'none' }}>
            <div style={{ fontSize: '0.75rem', color: post.userKarma > 0 ? 'var(--hudhud-green)' : 'var(--hudhud-red)', fontWeight: 'bold', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: '10px' }}>
              Karma {post.userKarma}
            </div>
            <button onClick={(e) => handleVoteClick(e, 1)} style={{ background: 'transparent', border: 'none', color: post.userVote === 1 ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer', transform: post.userVote === 1 ? 'scale(1.2)' : 'none', transition: 'all 0.2s' }}>▲</button>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', textShadow: isImage ? '0 2px 4px rgba(0,0,0,0.8)' : 'none' }}>{post.votes}</span>
            <button onClick={(e) => handleVoteClick(e, -1)} style={{ background: 'transparent', border: 'none', color: post.userVote === -1 ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer', transform: post.userVote === -1 ? 'scale(1.2)' : 'none', transition: 'all 0.2s' }}>▼</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, textShadow: isImage ? '0 1px 3px rgba(0,0,0,0.8)' : 'none' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>📍 {post.distance}</span>
            <span>⏳ {post.time}</span>
            <span onClick={onReport} style={{ cursor: 'pointer', textDecoration: 'underline' }}>🚩 {isAr ? 'إبلاغ' : 'Report'}</span>
          </div>
          <div>💬 {post.comments.length}</div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, index, color, onReply, isMod }: { comment: Comment, index: number, color: string, onReply: (mention: string) => void, isMod: boolean }) {
  const [touchStart, setTouchStart] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStart;
    if (diff < 0) { // swipe left to reply
      setSwipeOffset(Math.max(diff, -80));
    } else {
      setSwipeOffset(0);
    }
  };
  const handleTouchEnd = () => {
    if (swipeOffset < -40) {
      onReply(`@${index + 1} `);
    }
    setSwipeOffset(0);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', marginBottom: '1rem' }}>
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          padding: '1rem', 
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transform: `translateX(${swipeOffset}px)`, 
          transition: swipeOffset === 0 ? 'transform 0.3s ease' : 'none', 
          position: 'relative', 
          zIndex: 2, 
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#{index + 1}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: color }}>{comment.userName}</span>
            <span style={{ fontSize: '0.7rem', color: comment.userKarma > 0 ? 'var(--hudhud-green)' : 'var(--hudhud-red)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>Karma {comment.userKarma}</span>
          </div>
          {isMod && (
            <button onClick={() => alert('Voted to ban user in comment')} style={{ background: 'transparent', border: '1px solid rgba(255,165,0,0.5)', color: 'orange', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>🔨 Ban</button>
          )}
        </div>
        <div>{comment.text}</div>
      </div>
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '80px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', zIndex: 1 }}>
        Reply
      </div>
    </div>
  );
}

function HudhudFeed() {
  const { user } = useSSO();
  const { lang } = useLang();
  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS);
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'voice'>('all');
  
  const [isComposing, setIsComposing] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImg, setNewPostImg] = useState("");
  const [newPostVoice, setNewPostVoice] = useState(false);
  
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isPlusUser, setIsPlusUser] = useState(false);
  const [useLiveDB, setUseLiveDB] = useState(false);

  const [bannedKeywords, setBannedKeywords] = useState<{id?: string, word: string, votes: number, active: boolean}[]>([
    { word: 'سبام', votes: 3, active: true },
    { word: 'احتيال', votes: 1, active: false }
  ]);
  const [isModDashboardOpen, setIsModDashboardOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const [activeSwiperIndex, setActiveSwiperIndex] = useState<number | null>(null);

  const isAr = lang === 'ar';
  const isMod = user && user.postCount > MOCK_SETTINGS.modThreshold;

  // --- PocketBase Data Fetching ---
  const fetchPosts = useCallback(async () => {
    try {
      const records = await pb.collection('posts').getFullList({ sort: '-created', expand: 'user' });
      const mapped: Post[] = records.map((r: any) => ({
        id: r.id,
        userName: r.expand?.user?.name || 'مجهول',
        userKarma: r.expand?.user?.karma || 0,
        text: r.text || '',
        color: r.color || HUDHUD_COLORS[0],
        votes: r.votes || 0,
        userVote: 0,
        comments: [],
        time: new Date(r.created).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        distance: 'هنا',
        imageUrl: r.imageUrl ? pb.files.getURL(r, r.imageUrl) : null,
        imageCaption: null,
        voiceUrl: r.voiceUrl ? pb.files.getURL(r, r.voiceUrl) : null,
        banVotes: r.banVotes || 0,
      }));
      // Fetch comments for each post
      for (const post of mapped) {
        try {
          const comments = await pb.collection('comments').getFullList({ filter: `post='${post.id}'`, expand: 'user' });
          post.comments = comments.map((c: any) => ({
            id: c.id,
            text: c.text,
            userName: c.expand?.user?.name || 'مجهول',
            userKarma: c.expand?.user?.karma || 0,
            banVotes: c.banVotes || 0,
          }));
        } catch (_e) { /* no comments yet */ }
      }
      setPosts(mapped);
      setUseLiveDB(true);
    } catch (_e) {
      // PocketBase not available, use dummy data
      setUseLiveDB(false);
    }
  }, []);

  const fetchKeywords = useCallback(async () => {
    try {
      const records = await pb.collection('banned_keywords').getFullList();
      if (records.length > 0) {
        setBannedKeywords(records.map((r: any) => ({ id: r.id, word: r.word, votes: r.votes || 0, active: r.active || false })));
      }
    } catch (_e) { /* use local fallback */ }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchKeywords();
  }, [fetchPosts, fetchKeywords]);

  const handleProposeKeyword = async () => {
    if(!newKeyword.trim()) return;
    if (useLiveDB) {
      try {
        await pb.collection('banned_keywords').create({ word: newKeyword.trim(), votes: 1, active: false });
        fetchKeywords();
      } catch (_e) { /* fallback */ }
    } else {
      setBannedKeywords([...bannedKeywords, { word: newKeyword.trim(), votes: 1, active: false }]);
    }
    setNewKeyword("");
  };

  const handleVoteKeyword = async (index: number) => {
    const kw = bannedKeywords[index];
    const newVotes = kw.votes + 1;
    const nowActive = newVotes >= 3;
    if (useLiveDB && kw.id) {
      try {
        await pb.collection('banned_keywords').update(kw.id, { votes: newVotes, active: nowActive });
        fetchKeywords();
        return;
      } catch (_e) { /* fallback */ }
    }
    const updated = [...bannedKeywords];
    updated[index].votes = newVotes;
    if (nowActive) updated[index].active = true;
    setBannedKeywords(updated);
  };

  const handlePost = async () => {
    if (!newPostText.trim() && !newPostImg && !newPostVoice) return;
    
    // Check keywords
    const activeKeywords = bannedKeywords.filter(k => k.active).map(k => k.word);
    if (activeKeywords.some(kw => newPostText.includes(kw))) {
      alert(isAr ? 'تم الحذف تلقائياً لاحتوائه على كلمات محظورة.' : 'Auto-removed for containing banned keywords.');
      setIsComposing(false);
      setNewPostText(""); setNewPostImg(""); setNewPostVoice(false);
      return;
    }

    if (useLiveDB && pb.authStore.isValid) {
      try {
        await pb.collection('posts').create({
          text: newPostText,
          color: HUDHUD_COLORS[Math.floor(Math.random() * HUDHUD_COLORS.length)],
          votes: 0,
          banVotes: 0,
          user: pb.authStore.model?.id,
        });
        setIsComposing(false);
        setNewPostText(""); setNewPostImg(""); setNewPostVoice(false);
        fetchPosts();
        return;
      } catch (_e) { /* fallback to local */ }
    }

    const post: Post = {
      id: Date.now(),
      userName: "أنا", userKarma: 10,
      text: newPostText,
      color: HUDHUD_COLORS[Math.floor(Math.random() * HUDHUD_COLORS.length)],
      votes: 0, userVote: 0, comments: [], time: isAr ? "الآن" : "Just now", distance: "هنا",
      imageUrl: newPostImg || null, imageCaption: null, voiceUrl: newPostVoice ? "dummy.mp3" : null, banVotes: 0
    };
    setPosts([post, ...posts]);
    setIsComposing(false);
    setNewPostText(""); setNewPostImg(""); setNewPostVoice(false);
  };

  const handleReply = async () => {
    if(!replyText.trim() || !activePost) return;

    // Check keywords
    const activeKeywords = bannedKeywords.filter(k => k.active).map(k => k.word);
    if (activeKeywords.some(kw => replyText.includes(kw))) {
      alert(isAr ? 'تم الحذف تلقائياً لاحتوائه على كلمات محظورة.' : 'Auto-removed for containing banned keywords.');
      setReplyText("");
      setIsReplying(false);
      return;
    }

    if (useLiveDB && pb.authStore.isValid) {
      try {
        await pb.collection('comments').create({
          text: replyText,
          post: activePost.id,
          user: pb.authStore.model?.id,
          banVotes: 0,
        });
        setReplyText("");
        setIsReplying(false);
        fetchPosts();
        return;
      } catch (_e) { /* fallback */ }
    }

    const updatedPosts = posts.map(p => {
      if(p.id !== activePost.id) return p;
      return { ...p, comments: [...p.comments, { id: Date.now(), text: replyText, userName: "أنا", userKarma: 10, banVotes: 0 }] };
    });
    setPosts(updatedPosts);
    setReplyText("");
    setIsReplying(false);
  };

  const filteredPosts = posts.filter(p => filter === 'all' || (filter === 'text' && !p.imageUrl && !p.voiceUrl) || (filter === 'image' && !!p.imageUrl) || (filter === 'voice' && !!p.voiceUrl));
  const imagePosts = posts.filter(p => !!p.imageUrl);

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Access Denied</h2></div>;

  if (activeSwiperIndex !== null) {
    return <ImageSwiper posts={imagePosts} startIndex={activeSwiperIndex} onClose={() => setActiveSwiperIndex(null)} />;
  }

  if (activePost) {
    const livePost = posts.find(p => p.id === activePost.id) || activePost;
    return (
      <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', minHeight: '80vh', paddingBottom: '100px' }}>
        <button onClick={() => setActivePost(null)} className="btn-outline" style={{ marginBottom: '1rem' }}>{isAr ? '← العودة' : '← Back'}</button>
        <PostCard post={livePost} onVote={() => {}} onReport={() => {}} onDelete={() => {}} isMod={isMod} onClick={() => {}} onImageClick={() => {}} />
        
        <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          {livePost.comments.map((c: any, index: number) => (
            <CommentItem key={c.id} comment={c} index={index} color={livePost.color} onReply={(mention) => { setReplyText(mention); setIsReplying(true); }} isMod={isMod} />
          ))}
        </div>

        {/* Mobile Popup Reply Button */}
        <button 
          onClick={() => setIsReplying(true)}
          style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 100 }}
        >
          {isAr ? '💬 أضف تعليق' : '💬 Reply'}
        </button>

        {isReplying && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface-color)', padding: '1rem', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', boxShadow: '0 -4px 20px rgba(0,0,0,0.3)', zIndex: 101, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{isAr ? 'رد على المحادثة' : 'Reply to chat'}</span>
              <button onClick={() => setIsReplying(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <textarea 
              autoFocus
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={isAr ? "اكتب تعليقك هنا..." : "Type your comment..."} 
              style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
            />
            <button onClick={handleReply} className="btn-primary" style={{ padding: '1rem', borderRadius: '12px' }}>{isAr ? 'إرسال' : 'Send'}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', position: 'relative', minHeight: '80vh', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--surface-color)', padding: '0.5rem', borderRadius: '16px', overflowX: 'auto' }}>
        {['all', 'text', 'image', 'voice'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)} style={{ flex: 1, minWidth: '60px', padding: '0.75rem', borderRadius: '12px', border: 'none', fontWeight: 800, background: filter === f ? 'var(--primary-color)' : 'transparent', color: filter === f ? 'white' : 'var(--text-secondary)' }}>
            {isAr ? (f==='all'?'الكل':f==='text'?'نصوص':f==='image'?'صور':'صوت') : (f.charAt(0).toUpperCase() + f.slice(1))}
          </button>
        ))}
      </div>

      <div className="hudhud-feed">
        {filteredPosts.map(post => (
          <PostCard 
            key={post.id} post={post} onVote={() => {}} onReport={() => {}} onDelete={() => {}} isMod={isMod} 
            onClick={() => setActivePost(post)} 
            onImageClick={() => setActiveSwiperIndex(imagePosts.findIndex(p => p.id === post.id))}
          />
        ))}
      </div>
      
      {/* Floating Action Button (Moved up slightly to avoid footer) */}
      <button 
        onClick={() => setIsComposing(true)}
        style={{ position: 'fixed', bottom: '80px', right: '1rem', width: '60px', height: '60px', borderRadius: '30px', background: 'var(--text-primary)', color: 'var(--bg-color)', fontSize: '2rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 100 }}
      >
        +
      </button>

      {/* Settings / Mod Footer Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 90 }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem' }}>🏠</button>
        {isMod && <button onClick={() => setIsModDashboardOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--hudhud-green)', fontSize: '1.2rem' }}>🛡️</button>}
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem' }}>⚙️</button>
      </div>

      {isComposing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', background: HUDHUD_COLORS[0], display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{isAr ? 'إنشاء منشور' : 'Create Post'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.5rem', borderRadius: '8px' }}>
                <input type="checkbox" checked={isPlusUser} onChange={e => setIsPlusUser(e.target.checked)} id="plus-toggle" />
                <label htmlFor="plus-toggle" style={{ fontSize: '0.8rem' }}>Plus User</label>
              </div>
            </div>
            
            <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder={isAr ? "ماذا يدور في ذهنك؟" : "What's on your mind?"} style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.25)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', resize: 'none' }} />
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => {
                const limit = isPlusUser ? "1 minute" : "15 seconds";
                alert(`Started Camera/Voice Recording (Limit: ${limit}). Plus users get up to 1 minute!`);
                setNewPostVoice(true);
              }} style={{ flex: 1, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px' }}>
                🎙️ / 📷 Record
              </button>
              <button onClick={() => {
                if (isPlusUser) {
                  alert('Gallery opened for Plus user.');
                  setNewPostImg('https://images.unsplash.com/photo-1542281286-9e0a16bb7366');
                } else {
                  alert('Gallery upload is only available for Plus users! Please subscribe.');
                }
              }} style={{ flex: 1, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px' }}>
                🖼️ Gallery
              </button>
            </div>

            {(newPostVoice || newPostImg) && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '8px', color: 'white', textAlign: 'center', fontSize: '0.9rem' }}>
                {newPostVoice ? 'Audio/Video Attached ✅' : 'Image Attached ✅'}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button onClick={() => { setIsComposing(false); setNewPostImg(""); setNewPostVoice(false); }} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none' }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handlePost} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'white', color: 'black', border: 'none', fontWeight: 'bold' }}>{isAr ? 'نشر' : 'Post'}</button>
            </div>
          </div>
        </div>
      )}

      {isModDashboardOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          <div className="glass-panel" style={{ background: 'var(--surface-color)', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{isAr ? 'لوحة المشرفين' : 'Mod Dashboard'}</h2>
              <button onClick={() => setIsModDashboardOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            
            <h3>{isAr ? 'الكلمات المحظورة (إزالة تلقائية)' : 'Banned Keywords (Auto-Remove)'}</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder={isAr ? "اقترح كلمة جديدة..." : "Propose new keyword..."} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
              <button onClick={handleProposeKeyword} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>{isAr ? 'اقتراح' : 'Propose'}</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {bannedKeywords.map((kw, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <span>{kw.word}</span>
                  {kw.active ? (
                    <span style={{ color: 'var(--hudhud-green)', fontWeight: 'bold' }}>{isAr ? 'نشط' : 'Active'}</span>
                  ) : (
                    <button onClick={() => handleVoteKeyword(i)} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {isAr ? `أوافق (${kw.votes}/3)` : `Approve (${kw.votes}/3)`}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              {isAr ? '* الكلمات المقترحة تحتاج لموافقة 3 مشرفين لتصبح نشطة.' : '* Proposed words need 3 moderator approvals to become active.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProviders hideFooter={true}>
      <LocationGuard>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-color)' }}>
          <ChatHeader />
          <main style={{ flex: 1 }}><HudhudFeed /></main>
        </div>
      </LocationGuard>
    </AppProviders>
  );
}

export default App;
