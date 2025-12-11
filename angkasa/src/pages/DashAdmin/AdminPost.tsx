// src/components/admin/AdminPost.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  LinkIcon,
  Image,
  BookOpen,
  Clock,
  MoreVertical,
  X,
  Tag,
} from 'lucide-react';
import type { Post } from './AdminCommon';
import { InputField, Modal } from './AdminCommon';
import { ref, push, set, remove, onValue, update } from 'firebase/database';
import { auth, rtdb } from '../../firebase';

// Component: Post Form
const PostForm: React.FC<{
  onClose: () => void;
  postToEdit?: Post | null;
  onSubmit: (data: Omit<Post, 'id' | 'createdAt'>) => void;
}> = ({ onClose, postToEdit, onSubmit }) => {
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [description, setDescription] = useState(postToEdit?.description || '');
  const [imageUrl, setImageUrl] = useState(postToEdit?.imageUrl || '');
  const [eventDate, setEventDate] = useState(
    postToEdit ? postToEdit.eventDate.toISOString().split('T')[0] : ''
  );
  const [closingDate, setClosingDate] = useState(
    postToEdit ? postToEdit.closingDate.toISOString().split('T')[0] : ''
  );
  const [registrationLink, setRegistrationLink] = useState(postToEdit?.registrationLink || '');
  const [type, setType] = useState<'lomba' | 'beasiswa'>(
    postToEdit?.type || 'lomba'
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    postToEdit?.tags || []
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(closingDate) < new Date(eventDate)) {
      setError('Tanggal Penutupan Pendaftaran tidak boleh sebelum Tanggal Acara.');
      return;
    }

    if (imageUrl.trim() && !/^https?:\/\//.test(imageUrl.trim())) {
      setError('URL Gambar harus diawali dengan https://');
      return;
    }

    onSubmit({
      title,
      description,
      imageUrl: imageUrl.trim() || 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Post+Image',
      eventDate: new Date(eventDate),
      closingDate: new Date(closingDate),
      registrationLink: registrationLink || '#',
      type,
      tags,
    });
    onClose();
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (tags.includes(tagInput.trim())) {
      setError('Tag sudah ada.');
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        id="title"
        label="Judul Postingan"
        type="text"
        value={title}
        onChange={setTitle}
        Icon={BookOpen}
      />
      <InputField
        id="description"
        label="Deskripsi"
        type="textarea"
        value={description}
        onChange={setDescription}
        Icon={BookOpen}
      />
      <InputField
        id="imageUrl"
        label="URL Gambar (Opsional, wajib https://)"
        type="url"
        value={imageUrl}
        onChange={setImageUrl}
        required={false}
        Icon={Image}
      />

      {/* Tipe Postingan */}
      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium text-white flex items-center">
          <Tag size={16} className="mr-2 text-blue-400" />
          Tipe Postingan <span className="text-red-400 ml-1">*</span>
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType('lomba')}
            className={`flex-1 py-2 px-3 rounded-lg border transition ${
              type === 'lomba'
                ? 'bg-blue-700/50 border-blue-500 text-blue-300'
                : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Tag size={16} className="inline mr-1" /> Lomba
          </button>
          <button
            type="button"
            onClick={() => setType('beasiswa')}
            className={`flex-1 py-2 px-3 rounded-lg border transition ${
              type === 'beasiswa'
                ? 'bg-purple-700/50 border-purple-500 text-purple-300'
                : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Tag size={16} className="inline mr-1" /> Beasiswa
          </button>
        </div>
      </div>

      {/* Hashtag Input */}
      <div className="space-y-1">
        <label htmlFor="tagInput" className="text-sm font-medium text-white flex items-center">
          <Tag size={16} className="mr-2 text-blue-400" />
          Hashtag (Opsional)
        </label>
        <div className="flex gap-2">
          <input
            id="tagInput"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Contoh: #desain, #nasional, #mahasiswa"
            className="flex-1 px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            +
          </button>
        </div>
        {error && error.startsWith('Tag') && (
          <p className="text-red-400 text-sm italic mt-1">{error}</p>
        )}
      </div>

      {/* Daftar Tag */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="px-2.5 py-1 bg-slate-700/40 text-slate-300 text-xs rounded-full flex items-center gap-1"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 text-slate-400 hover:text-slate-200"
                aria-label={`Hapus tag ${tag}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <InputField
        id="eventDate"
        label="Tanggal Acara"
        type="date"
        value={eventDate}
        onChange={setEventDate}
        Icon={Calendar}
      />
      <InputField
        id="closingDate"
        label="Tanggal Penutupan Pendaftaran"
        type="date"
        value={closingDate}
        onChange={setClosingDate}
        Icon={Clock}
      />
      <InputField
        id="regLink"
        label="Link Pendaftaran"
        type="url"
        value={registrationLink}
        onChange={setRegistrationLink}
        Icon={LinkIcon}
      />
      {error && !error.startsWith('Tag') && (
        <p className="text-red-400 text-sm italic mt-2">{error}</p>
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition shadow-md shadow-blue-800/50"
        >
          {postToEdit ? 'Simpan Perubahan' : 'Tambah Postingan'}
        </button>
      </div>
    </form>
  );
};

// Full-Width Bottom Modal for Mobile Detail
const PostDetailBottomModal: React.FC<{
  post: Post;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}> = ({ post, onClose, onEdit, onDelete }) => {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus postingan "${post.title}"?`)) {
      onDelete(post.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-gray-800 border-t-4 border-slate-600 rounded-t-2xl p-4 transform transition-transform duration-300 ease-out translate-y-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
              target.alt = 'Gambar tidak dapat dimuat';
            }}
          />
        </div>

        <h2 className="text-xl font-bold text-blue-400 mb-2">{post.title}</h2>
        <p className="text-gray-300 mb-4 whitespace-pre-line">{post.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar size={14} className="mr-2 text-blue-400" />
            <span>{formatDate(post.eventDate)}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-2 text-blue-400" />
            <span>{formatDate(post.closingDate)}</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-700/40 text-slate-300 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={post.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 mb-4 bg-blue-700/30 text-blue-300 rounded-lg hover:bg-blue-600/40 transition"
        >
          <LinkIcon size={14} className="inline mr-1" />
          Buka Link Pendaftaran
        </a>

        <div className="flex space-x-2">
          <button
            onClick={() => {
              onEdit(post);
              onClose();
            }}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// Component: Post Card
const PostCard: React.FC<{
  post: Post;
  onMoreClick: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}> = ({ post, onMoreClick, onEdit, onDelete }) => {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <>
      <div className="sm:hidden bg-gray-800 border border-slate-700 rounded-xl p-1 flex flex-col space-y-2 hover:bg-gray-750 transition duration-200 relative">
        <div className="w-full flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="mx-auto h-20 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
              target.alt = 'Gambar tidak dapat dimuat';
            }}
          />
        </div>
        <div className="flex-grow space-y-0.5 min-w-0">
          <h3 className="text-sm font-bold text-blue-400 line-clamp-1 break-words">{post.title}</h3>
          <p className="text-xs text-gray-300 line-clamp-2 break-words">
            {truncateText(post.description, 30)}
          </p>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="px-1 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="px-1 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => onMoreClick(post)}
          className="absolute bottom-1 right-1 p-0.5 bg-gray-700/80 rounded-full text-white hover:bg-gray-600 transition shadow-sm"
          aria-label="Lihat detail"
        >
          <MoreVertical size={12} />
        </button>
      </div>

      <div className="hidden sm:block bg-gray-800 border border-slate-700 rounded-xl p-4 flex flex-col space-y-3 hover:shadow-lg hover:shadow-blue-900/30 transition duration-300 h-full relative">
        <div className="w-full flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-full h-32 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
              target.alt = 'Gambar tidak dapat dimuat';
            }}
          />
        </div>
        <div className="flex-grow space-y-2">
          <h3 className="text-lg font-bold text-blue-400 line-clamp-1">{post.title}</h3>
          <p className="text-sm text-gray-300 line-clamp-2">{post.description}</p>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
            <p className="flex items-center">
              <Calendar size={12} className="mr-1 text-blue-400" /> {post.eventDate.toLocaleDateString('id-ID')}
            </p>
            <p className="flex items-center">
              <Clock size={12} className="mr-1 text-blue-400" /> {post.closingDate.toLocaleDateString('id-ID')}
            </p>
          </div>
          <a
            href={post.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-400 text-xs flex items-center"
          >
            <LinkIcon size={12} className="mr-1" /> Link Pendaftaran
          </a>
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-1 z-10">
          <button
            onClick={() => onEdit?.(post)}
            className="p-1.5 bg-blue-600/80 rounded-full text-white hover:bg-blue-500 transition shadow-sm"
            aria-label="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete?.(post.id)}
            className="p-1.5 bg-red-600/80 rounded-full text-white hover:bg-red-500 transition shadow-sm"
            aria-label="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

// Component: AdminPost — Versi Akhir
const AdminPost: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const postsRef = ref(rtdb, `admins/${currentUser.uid}/posts`);
    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const postsArray: Post[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          eventDate: new Date(data[key].eventDate),
          closingDate: new Date(data[key].closingDate),
          createdAt: new Date(data[key].createdAt),
        }));
        postsArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 TAMBAH POSTINGAN → GUNAKAN SATU ID UNTUK KEDUA TEMPAT
  const handleAddPost = async (data: Omit<Post, 'id' | 'createdAt'>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 🔥 Buat ID sekali di path global
      const globalPostsRef = ref(rtdb, 'posts');
      const newPostRef = push(globalPostsRef);
      const postId = newPostRef.key!;

      // 1. Simpan ke path global (forum)
      await set(newPostRef, {
        id: postId,
        author: currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin',
        authorId: currentUser.uid,
        avatar: '',
        content: data.description,
        image: data.imageUrl,
        likes: 0,
        comments: [],
        timestamp: new Date().toISOString(),
        category: data.type === 'lomba' ? 'lomba' : 'beasiswa',
        title: data.title,
        type: data.type,
        tags: data.tags || [],
        registrationLink: data.registrationLink,
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
      });

      // 2. Simpan ke folder admin — dengan ID yang sama
      await set(ref(rtdb, `admins/${currentUser.uid}/posts/${postId}`), {
        ...data,
        createdAt: new Date().toISOString(),
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
      });

    } catch (error) {
      console.error('Error adding post:', error);
      alert('Gagal menambahkan postingan. Coba lagi.');
    }
  };

  // 🔥 UPDATE → GUNAKAN ID YANG SAMA
  const handleUpdatePost = async (data: Omit<Post, 'id' | 'createdAt'>) => {
    if (!postToEdit) return;

    try {
      await update(ref(rtdb, `admins/${auth.currentUser?.uid}/posts/${postToEdit.id}`), {
        ...data,
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
      });

      await update(ref(rtdb, `posts/${postToEdit.id}`), {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
        registrationLink: data.registrationLink,
        type: data.type,
        tags: data.tags || [],
      });

    } catch (error) {
      console.error('Error updating post:', error);
      alert('Gagal memperbarui postingan. Coba lagi.');
    }
  };

  // 🔥 HAPUS → GUNAKAN ID YANG SAMA
  const handleDeletePost = async (id: string) => {
    try {
      await remove(ref(rtdb, `admins/${auth.currentUser?.uid}/posts/${id}`));
      await remove(ref(rtdb, `posts/${id}`));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Gagal menghapus postingan. Coba lagi.');
    }
  };

  const handleAddClick = () => {
    setPostToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (post: Post) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleMoreClick = (post: Post) => {
    setSelectedPostForDetail(post);
  };

  const closeDetailModal = () => {
    setSelectedPostForDetail(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Memuat data postingan...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-screen pb-24">
      <h1 className="md:text-3xl font-extrabold text-white border-b border-slate-700 pb-3">
        Daftar Postingan ({posts.length})
      </h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <p className="text-xl text-gray-400 mb-6">Belum ada Postingan yang dibuat.</p>
          <button
            onClick={handleAddClick}
            className="p-1 bg-blue-600 rounded-full text-white shadow-xl hover:bg-blue-500 transition transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 animate-pulse-slow"
            aria-label="Tambah Postingan Pertama"
          >
            <Plus size={36} />
          </button>
          <p className="text-sm text-gray-500 mt-4">Klik untuk membuat Postingan pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
          {posts.map((post) => (
            <div key={post.id} className="col-span-1">
              <PostCard
                post={post}
                onMoreClick={handleMoreClick}
                onEdit={handleEditClick}
                onDelete={handleDeletePost}
              />
            </div>
          ))}
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed sm:hidden bottom-5 right-4 z-10">
        <button
          onClick={handleAddClick}
          className="p-3 bg-blue-600 rounded-full text-white shadow-xl hover:bg-blue-500 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400"
          aria-label="Tambah Postingan"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="fixed hidden sm:block bottom-6 right-6 z-10">
        <button
          onClick={handleAddClick}
          className="p-4 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400"
          aria-label="Tambah Postingan"
        >
          <Plus size={24} />
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={postToEdit ? 'Edit Postingan' : 'Tambah Postingan Baru'}
      >
        <div className="max-h-[80vh] overflow-y-auto pb-6">
          <PostForm
            onClose={() => setIsModalOpen(false)}
            postToEdit={postToEdit}
            onSubmit={postToEdit ? handleUpdatePost : handleAddPost}
          />
        </div>
      </Modal>

      {selectedPostForDetail && (
        <PostDetailBottomModal
          post={selectedPostForDetail}
          onClose={closeDetailModal}
          onEdit={handleEditClick}
          onDelete={handleDeletePost}
        />
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(85, 109, 247, 0.4); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite; }
      `}</style>
    </div>
  );
};

export default AdminPost;