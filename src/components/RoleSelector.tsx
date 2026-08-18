import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Role } from '../types';
import * as Icons from 'lucide-react';
import { X, ExternalLink } from 'lucide-react';

interface RoleSelectorProps {
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
  label?: string;
  showLabel?: boolean;
}

export function RoleSelector({ selectedRoleIds, onChange, label = 'Roles', showLabel = true }: RoleSelectorProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setRoles(data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleRole(roleId: string) {
    if (selectedRoleIds.includes(roleId)) {
      onChange(selectedRoleIds.filter(id => id !== roleId));
    } else {
      onChange([...selectedRoleIds, roleId]);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading roles...</div>;
  }

  const selectedRoles = roles.filter(r => selectedRoleIds.includes(r.id));

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedRoles.map((role) => {
            const IconComponent = (Icons as any)[role.icon] || Icons.Circle;
            return (
              <div
                key={role.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
                style={{
                  backgroundColor: `${role.color}15`,
                  borderColor: role.color,
                  color: role.color,
                }}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{role.name}</span>
                <button
                  onClick={() => toggleRole(role.id)}
                  className="ml-0.5 hover:opacity-70 transition-opacity"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {roles.map((role) => {
          const isSelected = selectedRoleIds.includes(role.id);
          const IconComponent = (Icons as any)[role.icon] || Icons.Circle;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => toggleRole(role.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              style={{
                borderColor: isSelected ? role.color : undefined,
                backgroundColor: isSelected ? `${role.color}10` : undefined,
              }}
              title={role.description}
            >
              <div className="flex items-center gap-2">
                <IconComponent
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: role.color }}
                />
                <span className={`text-sm font-medium truncate ${
                  isSelected ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {role.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedRoleIds.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Select one or more life roles for this task{' '}
          <a
            href="https://www.franklincovey.com/the-7-habits/habit-7/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 transition-colors underline"
          >
            <span>Learn about life balance</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>
      )}
    </div>
  );
}
