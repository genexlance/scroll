import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { GripVertical, Trash2, Upload, LogOut } from 'lucide-react';

interface Frame {
  id: string;
  url: string;
  order: number;
  active: boolean;
}

interface FramesManagerProps {
  onFramesUpdate?: () => void;
}

export function FramesManager({ onFramesUpdate }: FramesManagerProps) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  useEffect(() => {
    fetchFrames();
  }, []);

  async function fetchFrames() {
    try {
      const { data, error } = await supabase
        .from('frames')
        .select('*')
        .order('order');
      
      if (error) throw error;
      setFrames(data || []);
      if (onFramesUpdate) onFramesUpdate();
    } catch (error) {
      console.error('Error fetching frames:', error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFrames(files: FileList) {
    try {
      setUploading(true);
      setUploadProgress({ current: 0, total: files.length });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `frames/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('frames')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('frames')
          .getPublicUrl(filePath);

        // Add to frames table
        const newOrder = frames.length > 0 ? Math.max(...frames.map(f => f.order)) + i : i;
        const { error: dbError } = await supabase
          .from('frames')
          .insert([{ url: publicUrl, order: newOrder, active: true }]);

        if (dbError) throw dbError;
        
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
      }

      fetchFrames();
    } catch (error) {
      console.error('Error uploading frames:', error);
      alert('Error uploading frames. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  }

  async function deleteFrame(id: string, url: string) {
    try {
      // Delete from Storage
      const filePath = url.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('frames')
          .remove([`frames/${filePath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('frames')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFrames();
    } catch (error) {
      console.error('Error deleting frame:', error);
      alert('Error deleting frame. Please try again.');
    }
  }

  async function updateFrameOrder(draggedId: string, targetId: string) {
    const draggedFrame = frames.find(f => f.id === draggedId);
    const targetFrame = frames.find(f => f.id === targetId);
    if (!draggedFrame || !targetFrame) return;

    const newFrames = [...frames];
    const draggedIndex = frames.indexOf(draggedFrame);
    const targetIndex = frames.indexOf(targetFrame);

    newFrames.splice(draggedIndex, 1);
    newFrames.splice(targetIndex, 0, draggedFrame);

    // Update order numbers
    const updatedFrames = newFrames.map((frame, index) => ({
      ...frame,
      order: index,
    }));

    try {
      const { error } = await supabase
        .from('frames')
        .upsert(updatedFrames);

      if (error) throw error;
      setFrames(updatedFrames);
      if (onFramesUpdate) onFramesUpdate();
    } catch (error) {
      console.error('Error updating frame order:', error);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return <div className="p-8">Loading frames...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-black">Manage Frames</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Upload new frames */}
      <div className="mb-8">
        <label
          className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) uploadFrames(files);
            }}
            disabled={uploading}
          />
          <Upload className="w-6 h-6 text-gray-600" />
          <span className="text-gray-600 text-center">
            {uploading 
              ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} frames...`
              : 'Click or drag images to upload multiple frames'}
          </span>
          {uploading && (
            <div className="w-full max-w-xs mt-2 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          )}
        </label>
      </div>

      {/* Frames list */}
      <div className="space-y-4">
        {frames.map((frame) => (
          <div
            key={frame.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('frameId', frame.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedId = e.dataTransfer.getData('frameId');
              updateFrameOrder(draggedId, frame.id);
            }}
          >
            <GripVertical className="w-6 h-6 text-gray-400 cursor-move" />
            <img
              src={frame.url}
              alt={`Frame ${frame.order}`}
              className="w-24 h-16 object-cover rounded"
            />
            <div className="flex-1 truncate">{frame.url}</div>
            <button
              onClick={() => deleteFrame(frame.id, frame.url)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}