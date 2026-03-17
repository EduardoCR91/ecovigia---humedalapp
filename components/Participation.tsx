
import React, { useState } from 'react';
import { Heart, Edit2, ChevronLeft, Check, Trash2 } from 'lucide-react';
import { useParticipationViewModel } from '../useParticipationViewModel';
import { useAuth } from './AuthContext';

const Participation: React.FC = () => {
  const vm = useParticipationViewModel();
  const { user } = useAuth();
  const [newQuestion, setNewQuestion] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const renderFeed = () => (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-900">Comunidad</h2>
        <button onClick={() => vm.setView('profile')} className="flex items-center gap-2 bg-white p-1.5 pr-3 rounded-full border shadow-sm">
          <img src={vm.profile.avatar} className="w-8 h-8 rounded-full" alt="profile"/>
          <span className="text-xs font-bold">{vm.profile.name}</span>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">
          Comparte consultas o reflexiones sobre el humedal y ve las más recientes o destacadas por la comunidad.
        </p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => vm.setSortMode('latest')}
            className={`flex-1 py-1.5 rounded-full text-[11px] font-semibold ${
              vm.sortMode === 'latest'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Últimos
          </button>
          <button
            onClick={() => vm.setSortMode('top')}
            className={`flex-1 py-1.5 rounded-full text-[11px] font-semibold ${
              vm.sortMode === 'top'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Destacados
          </button>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-sm mb-4">
          <textarea
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            rows={3}
            className="w-full text-sm text-gray-700 border-none outline-none resize-none"
            placeholder="Escribe aquí tu consulta o aporte sobre el Humedal de Techo..."
          />
          <div className="flex justify-end mt-2">
            {editingPostId ? (
              <>
                <button
                  disabled={!newQuestion.trim() || !user}
                  onClick={() => {
                    if (!user || !newQuestion.trim() || !editingPostId) return;
                    vm.updatePost(editingPostId, newQuestion.trim());
                    setEditingPostId(null);
                    setNewQuestion('');
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white disabled:opacity-50 mr-2"
                >
                  Guardar cambios
                </button>
                <button
                  onClick={() => {
                    setEditingPostId(null);
                    setNewQuestion('');
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                disabled={!newQuestion.trim() || !user}
                onClick={() => {
                  if (!user || !newQuestion.trim()) return;
                  const displayName = vm.profile.name || 'Usuario';
                  vm.addPost(displayName, newQuestion.trim());
                  setNewQuestion('');
                }}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white disabled:opacity-50"
              >
                Publicar consulta
              </button>
            )}
          </div>
          {!user && (
            <p className="mt-1 text-[10px] text-gray-400">
              Debes iniciar sesión para publicar y dar like.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {vm.posts.map(post => {
          const isOwner =
            !!user && !!post.ownerId && post.ownerId === user.id;

          return (
            <div key={post.id} className="bg-white p-4 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.user}`} alt="user"/>
                  </div>
                  <span className="text-xs font-bold">{post.user}</span>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setNewQuestion(post.text);
                      }}
                      className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <Edit2 size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            '¿Seguro que deseas eliminar esta consulta? Esta acción no se puede deshacer.'
                          )
                        ) {
                          vm.deletePost(post.id);
                          if (editingPostId === post.id) {
                            setEditingPostId(null);
                            setNewQuestion('');
                          }
                        }
                      }}
                      className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{post.text}</p>
              <div className="flex gap-4 mt-4 text-gray-400">
                <button
                  disabled={!user}
                  onClick={() => vm.toggleLike(post.id)}
                  className={`flex gap-1 items-center text-xs ${
                    post.hasLiked ? 'text-emerald-600' : ''
                  } ${!user ? 'opacity-40' : ''}`}
                >
                  <Heart size={14} />
                  {post.likes}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-fadeIn">
      <button onClick={() => vm.setView('feed')} className="mb-6 flex gap-2 items-center text-gray-400"><ChevronLeft/> Volver</button>
      <div className="bg-white rounded-3xl p-6 text-center shadow-sm border mb-6">
        <img src={vm.profile.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-emerald-50" alt="profile"/>
        <h3 className="text-xl font-bold">{vm.profile.name}</h3>
        <p className="text-sm text-gray-500 my-2">{vm.profile.bio}</p>
        <p className="text-[11px] text-gray-400">
          Este nombre visible se sincroniza con tu perfil general. Puedes editarlo desde el botón flotante de perfil.
        </p>
        {user && (
          <div className="mt-4 pt-3 border-t border-gray-100 text-left text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Datos de tu cuenta</p>
            <p><span className="font-medium">Correo:&nbsp;</span>{user.email}</p>
            <p className="mt-1 text-[11px] text-gray-400">
              Estos datos vienen de tu inicio de sesión. Más adelante podemos sincronizarlos con tu perfil completo.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl text-center shadow-xs border">
          <span className="block font-black text-emerald-600 text-xl">{vm.profile.reportsCount}</span>
          <span className="text-[10px] text-gray-400 uppercase">Reportes</span>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center shadow-xs border">
          <span className="block font-black text-orange-600 text-xl">{vm.profile.points}</span>
          <span className="text-[10px] text-gray-400 uppercase">Puntos</span>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center shadow-xs border">
          <span className="block font-black text-blue-600 text-xl">3</span>
          <span className="text-[10px] text-gray-400 uppercase">Insignias</span>
        </div>
      </div>

      {vm.topReport && (
        <div className="mt-6 bg-white p-4 rounded-2xl shadow-xs border text-left">
          <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
            Reporte con más likes
          </p>
          <p className="text-sm font-bold text-emerald-900">{vm.topReport.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            Ha recibido <span className="font-semibold text-orange-600">{vm.topReport.likes}</span> likes.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4">
      {vm.view === 'feed' ? renderFeed() : renderProfile()}
    </div>
  );
};

export default Participation;
