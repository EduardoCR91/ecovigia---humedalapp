import React, { useEffect, useState } from 'react';
import { X, Shield, Search } from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseClient';

interface UserProfilePanelProps {
  onClose: () => void;
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [userRoleMessage, setUserRoleMessage] = useState<string | null>(null);
  const [managedUsers, setManagedUsers] = useState<
    {
      id: string;
      username: string | null;
      display_name: string | null;
      email: string | null;
      role: string | null;
    }[]
  >([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('username, display_name, role')
        .eq('id', user.id)
        .single();

      if (!err && data) {
        setUsername(data.username || '');
        setDisplayName(data.display_name || '');
        if (data.role === 'admin') {
          setIsAdmin(true);
        }
      } else {
        // fallback sin mostrar el correo completo
        const suggested =
          (user.email || '').split('@')[0] || 'Explorador del Techo';
        setDisplayName(suggested);
      }
      setLoading(false);
    };

    loadProfile().catch(() => setLoading(false));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        username: username || null,
        display_name: displayName || null,
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setMessage('Perfil actualizado correctamente.');
    }

    setLoading(false);
  };

  if (!user) return null;

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSearchError(null);
    setUserRoleMessage(null);
    if (!userSearch.trim()) return;

    setUserSearchLoading(true);
    const term = userSearch.trim();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, role')
      .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
      .limit(20);

    if (error) {
      setUserSearchError('No se pudieron cargar los usuarios. Revisa tus permisos.');
      setManagedUsers([]);
    } else if (data) {
      setManagedUsers(
        data.map(row => ({
          id: (row as any).id as string,
          username: (row as any).username ?? null,
          display_name: (row as any).display_name ?? null,
          email: (row as any).email ?? null,
          role: (row as any).role ?? 'user',
        }))
      );
      if (data.length === 0) {
        setUserSearchError('No se encontraron usuarios con ese criterio.');
      }
    }
    setUserSearchLoading(false);
  };

  const handleChangeManagedRole = (id: string, role: string) => {
    setManagedUsers(prev => prev.map(u => (u.id === id ? { ...u, role } : u)));
  };

  const handleSaveManagedRole = async (id: string) => {
    const target = managedUsers.find(u => u.id === id);
    if (!target) return;

    setUserRoleMessage(null);
    setUserSearchError(null);

    const { error } = await supabase.from('profiles').update({ role: target.role }).eq('id', id);

    if (error) {
      setUserSearchError('No se pudo actualizar el rol del usuario.');
    } else {
      setUserRoleMessage('Rol de usuario actualizado correctamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar perfil"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-emerald-900 mb-1">Tu perfil</h2>
        <p className="text-xs text-gray-500 mb-4">
          Revisa tus datos de cuenta y ajusta tu nombre visible o nombre de usuario.
        </p>

        <div className="mb-4 text-xs text-gray-600 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3">
          <p className="font-semibold text-emerald-800 mb-1">Datos de inicio de sesión</p>
          <p>
            <span className="font-medium">Correo:&nbsp;</span>
            {user.email}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Nombre visible
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Guardián del Techo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: humedal_guardian"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Se usará como @usuario en tus reportes. Más adelante validaremos que no se repita.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Shield size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-widest">
                  Gestión de usuarios
                </p>
                <p className="text-[11px] text-gray-500">
                  Busca por nombre de usuario o correo para cambiar el rol.
                </p>
              </div>
            </div>

            <form onSubmit={handleUserSearch} className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ej: humedal_guardian o correo"
                />
              </div>
              <button
                type="submit"
                disabled={userSearchLoading || !userSearch.trim()}
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold disabled:opacity-60"
              >
                {userSearchLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            {userSearchError && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-xl p-2 mb-2">
                {userSearchError}
              </p>
            )}
            {userRoleMessage && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-2 mb-2">
                {userRoleMessage}
              </p>
            )}

            {managedUsers.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                {managedUsers.map(u => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-800">
                        {u.display_name || u.username || 'Usuario sin nombre'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {u.username ? `@${u.username}` : 'Sin usuario'}{' '}
                        {u.email ? `• ${u.email}` : ''}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <select
                        value={u.role ?? 'user'}
                        onChange={e => handleChangeManagedRole(u.id, e.target.value)}
                        className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 bg-white"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleSaveManagedRole(u.id)}
                        className="text-[10px] text-emerald-700 font-semibold"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-gray-100">
          <button
            onClick={async () => {
              await signOut();
              onClose();
            }}
            className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePanel;
