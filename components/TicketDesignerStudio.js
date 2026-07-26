'use client';
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, Trash2, Save, RotateCcw, Printer, Image as ImageIcon, 
  Type, Square, Circle, Triangle, FlipHorizontal, FlipVertical, Move, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const JUMANJI_PRESET = {
  bgImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
  width: 800,
  height: 226,
  flipX: false,
  flipY: false,
  elements: [
    { id: 'el-1', type: 'text', text: 'PROUDLY PRESENTS', x: 24, y: 32, fontSize: 11, fontWeight: '800', color: '#fb923c', fontFamily: 'Outfit' },
    { id: 'el-2', type: 'text', text: 'JUMANJI', x: 24, y: 52, fontSize: 34, fontWeight: '900', color: '#ffffff', fontFamily: "'Playfair Display', serif" },
    { id: 'el-3', type: 'text', text: 'Movie: {movie}', x: 24, y: 96, fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit' },
    { id: 'el-4', type: 'text', text: '{first_name} {last_name}', x: 24, y: 122, fontSize: 20, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
    { id: 'el-5', type: 'text', text: '{seat}', x: 24, y: 168, fontSize: 15, fontWeight: '800', color: '#FFDD00', fontFamily: 'monospace' },
    { id: 'el-6', type: 'text', text: 'SATURDAY, 11 JULY 2026', x: 420, y: 48, fontSize: 18, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
    { id: 'el-7', type: 'text', text: 'START 03.45 PM', x: 420, y: 76, fontSize: 12, fontWeight: '700', color: '#fb923c', fontFamily: 'Outfit' },
    { id: 'el-8', type: 'text', text: 'Oxford International School, Samarkand', x: 420, y: 180, fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' },
    { id: 'el-9', type: 'text', text: 'ADMIT ONE', x: 740, y: 65, fontSize: 18, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit', rotate: 90 },
  ]
};

export default function TicketDesignerStudio({ onSaveSuccess }) {
  const [design, setDesign] = useState(JUMANJI_PRESET);
  const [selectedId, setSelectedId] = useState('el-4');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sample data for preview
  const sampleData = {
    first_name: 'Ozodbek',
    last_name: 'Jumayev',
    movie: 'Jumanji: The Next Level',
    seat: 'Block C1 · Row 2 · Seat #14',
    ticket_id: 'MD-99877196',
    phone: '+998 77 196 00 20',
    branch: 'Oxford International School',
    level: 'Advanced'
  };

  useEffect(() => {
    // Load saved template from Supabase
    supabase.from('page_sections').select('data').eq('type', 'ticket_template').single().then(({ data }) => {
      if (data?.data && data.data.elements) {
        setDesign(data.data);
      }
    });
  }, []);

  const selectedEl = design.elements.find(el => el.id === selectedId);

  const updateSelected = (key, val) => {
    if (!selectedId) return;
    setDesign(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === selectedId ? { ...el, [key]: val } : el)
    }));
  };

  const addElement = (type) => {
    const newId = `el-${Date.now()}`;
    const newEl = {
      id: newId,
      type,
      text: type === 'text' ? 'New Text Layer' : '',
      x: 100,
      y: 100,
      fontSize: 16,
      fontWeight: '700',
      color: '#ffffff',
      fontFamily: 'Outfit',
      width: type === 'rect' ? 80 : 40,
      height: type === 'rect' ? 40 : 40,
    };
    setDesign(prev => ({ ...prev, elements: [...prev.elements, newEl] }));
    setSelectedId(newId);
  };

  const deleteElement = (id) => {
    setDesign(prev => ({ ...prev, elements: prev.elements.filter(el => el.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const saveDesign = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('page_sections').select('id').eq('type', 'ticket_template').single();
      if (existing) {
        await supabase.from('page_sections').update({ data: design, updated_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('page_sections').insert([{ page_slug: 'home', type: 'ticket_template', order_index: 99, data: design }]);
      }
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
      onSaveSuccess?.();
    } catch (err) {
      console.error('Error saving ticket template:', err);
      alert('Error saving ticket design template');
    } finally {
      setSaving(false);
    }
  };

  const renderTextContent = (rawText) => {
    if (!rawText) return '';
    return rawText
      .replace(/{first_name}/g, sampleData.first_name)
      .replace(/{last_name}/g, sampleData.last_name)
      .replace(/{movie}/g, sampleData.movie)
      .replace(/{seat}/g, sampleData.seat)
      .replace(/{ticket_id}/g, sampleData.ticket_id)
      .replace(/{phone}/g, sampleData.phone)
      .replace(/{branch}/g, sampleData.branch)
      .replace(/{level}/g, sampleData.level);
  };

  const handleTestPrint = () => {
    const el = document.getElementById('ticket-designer-stage');
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Test Print Pass</title>
          <style>
            body { background: #000; padding: 40px; display: flex; justify-content: center; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{ background: '#0a0d14', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* ── Top Control Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: '#fff' }}>
            🎟️ Ticket Designer Studio
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
            Build your custom ticket template dynamically with drag, text layers, and placeholders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={() => setDesign(p => ({ ...p, flipX: !p.flipX }))}>
            <FlipHorizontal size={14} /> Flip X
          </button>
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={() => setDesign(p => ({ ...p, flipY: !p.flipY }))}>
            <FlipVertical size={14} /> Flip Y
          </button>
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', borderColor: '#ea580c', color: '#fb923c' }} onClick={() => setDesign(JUMANJI_PRESET)}>
            ⚡ Jumanji Preset
          </button>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }} onClick={() => setDesign({ bgImage: '', width: 800, height: 226, flipX: false, flipY: false, elements: [] })}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={handleTestPrint}>
            <Printer size={14} /> Test Print
          </button>
          <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'linear-gradient(135deg, #ea580c, #fb923c)', border: 'none', fontWeight: 800, padding: '8px 18px' }} onClick={saveDesign} disabled={saving}>
            {saving ? 'Saving...' : savedMsg ? <> <Check size={14}/> Saved Live! </> : <> <Save size={14}/> Save Design </>}
          </button>
        </div>
      </div>

      {/* ── Studio Layout: Left Controls + Right Stage ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT TOOLBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
          
          {/* Background Upload */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px' }}>
              BACKGROUND IMAGE
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ fontSize: '12px', flex: 1, background: 'rgba(0,0,0,0.4)' }}
                placeholder="Background URL..." 
                value={design.bgImage || ''} 
                onChange={e => setDesign(p => ({ ...p, bgImage: e.target.value }))} 
              />
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '11px' }}>
                {isUploading ? '...' : 'Upload'}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={async (e) => {
                  const file = e.target.files[0]; if (!file) return;
                  setIsUploading(true);
                  const { data } = await supabase.storage.from('events').upload(`ticket_bg_${Math.random()}.${file.name.split('.').pop()}`, file);
                  if (data) {
                    const url = supabase.storage.from('events').getPublicUrl(data.path).data.publicUrl;
                    setDesign(p => ({ ...p, bgImage: url }));
                  }
                  setIsUploading(false);
                }} />
              </label>
            </div>
          </div>

          {/* Canvas Size */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px' }}>
              CANVAS SIZE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Width</span>
                <input type="number" className="form-input" style={{ fontSize: '12px', background: 'rgba(0,0,0,0.4)' }} value={design.width} onChange={e => setDesign(p => ({ ...p, width: Number(e.target.value) || 800 }))} />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Height</span>
                <input type="number" className="form-input" style={{ fontSize: '12px', background: 'rgba(0,0,0,0.4)' }} value={design.height} onChange={e => setDesign(p => ({ ...p, height: Number(e.target.value) || 226 }))} />
              </div>
            </div>
          </div>

          {/* Add Elements Toolbar */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px' }}>
              ADD ELEMENTS
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              <button className="btn btn-outline btn-sm" style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} onClick={() => addElement('text')} title="Add Text">
                <Type size={14} /> + Text
              </button>
              <button className="btn btn-outline btn-sm" style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} onClick={() => addElement('rect')} title="Add Rectangle">
                <Square size={14} /> + Rect
              </button>
              <button className="btn btn-outline btn-sm" style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} onClick={() => addElement('circ')} title="Add Circle">
                <Circle size={14} /> + Circ
              </button>
              <button className="btn btn-outline btn-sm" style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} onClick={() => addElement('tri')} title="Add Triangle">
                <Triangle size={14} /> + Tri
              </button>
              <button className="btn btn-outline btn-sm" style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} onClick={() => addElement('img')} title="Add Image">
                <ImageIcon size={14} /> + Img
              </button>
            </div>
          </div>

          {/* Element Inspector */}
          {selectedEl ? (
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fb923c' }}>Edit Selected Layer</span>
                <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => deleteElement(selectedEl.id)}>
                  <Trash2 size={12} /> Del
                </button>
              </div>

              {selectedEl.type === 'text' && (
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>TEXT CONTENT</span>
                  <input type="text" className="form-input" style={{ fontSize: '13px', background: 'rgba(0,0,0,0.5)', marginTop: '2px' }} value={selectedEl.text || ''} onChange={e => updateSelected('text', e.target.value)} />
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                    Placeholders: <code>{`{first_name}`}</code>, <code>{`{last_name}`}</code>, <code>{`{movie}`}</code>, <code>{`{seat}`}</code>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>X POS</span>
                  <input type="number" className="form-input" style={{ fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} value={selectedEl.x} onChange={e => updateSelected('x', Number(e.target.value))} />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Y POS</span>
                  <input type="number" className="form-input" style={{ fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} value={selectedEl.y} onChange={e => updateSelected('y', Number(e.target.value))} />
                </div>
              </div>

              {selectedEl.type === 'text' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>SIZE</span>
                      <input type="number" className="form-input" style={{ fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} value={selectedEl.fontSize || 14} onChange={e => updateSelected('fontSize', Number(e.target.value))} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>COLOR</span>
                      <input type="color" style={{ width: '100%', height: '34px', border: 'none', background: 'transparent', cursor: 'pointer' }} value={selectedEl.color || '#ffffff'} onChange={e => updateSelected('color', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>FONT FAMILY</span>
                    <select className="form-input" style={{ fontSize: '12px', background: 'rgba(0,0,0,0.5)', marginTop: '2px' }} value={selectedEl.fontFamily || 'Outfit'} onChange={e => updateSelected('fontFamily', e.target.value)}>
                      <option value="Outfit">Outfit</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="monospace">Monospace</option>
                      <option value="sans-serif">Sans-Serif</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '16px' }}>
              Click any element on the stage to edit properties
            </div>
          )}

        </div>

        {/* RIGHT STAGE CANVAS */}
        <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div 
            id="ticket-designer-stage"
            style={{
              width: `${design.width}px`,
              height: `${design.height}px`,
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: design.bgImage ? `url(${design.bgImage}) center/cover no-repeat` : 'linear-gradient(135deg, #181507 0%, #0a0802 100%)',
              transform: `scaleX(${design.flipX ? -1 : 1}) scaleY(${design.flipY ? -1 : 1})`,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              border: '2px solid rgba(255, 221, 0, 0.4)',
              flexShrink: 0,
            }}
          >
            {/* Render Elements */}
            {design.elements.map(el => {
              const isSel = el.id === selectedId;
              if (el.type === 'text') {
                return (
                  <div
                    key={el.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                    style={{
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      fontSize: `${el.fontSize || 14}px`,
                      fontWeight: el.fontWeight || '700',
                      color: el.color || '#ffffff',
                      fontFamily: el.fontFamily || 'Outfit',
                      cursor: 'pointer',
                      userSelect: 'none',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      outline: isSel ? '2px dashed #FFDD00' : 'none',
                      background: isSel ? 'rgba(255, 221, 0, 0.15)' : 'transparent',
                      transform: el.rotate ? `rotate(${el.rotate}deg)` : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {renderTextContent(el.text)}
                  </div>
                );
              }
              if (el.type === 'rect') {
                return (
                  <div
                    key={el.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                    style={{
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width || 60}px`,
                      height: `${el.height || 40}px`,
                      border: '2px solid #FFDD00',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      outline: isSel ? '2px dashed #ea580c' : 'none',
                    }}
                  />
                );
              }
              return null;
            })}

            {/* Stub QR Section on the Right */}
            <div style={{
              position: 'absolute',
              right: '90px',
              top: '20px',
              background: '#ffffff',
              padding: '6px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            }}>
              <QRCodeSVG
                value={`TicketPass:${sampleData.ticket_id}`}
                size={84}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            {/* Vertical Bar separator */}
            <div style={{
              position: 'absolute',
              right: '200px',
              top: 0,
              bottom: 0,
              borderRight: '2px dashed rgba(255,255,255,0.3)',
            }} />
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>
            Stage Dimensions: {design.width}px × {design.height}px · Click elements to edit positioning and text.
          </div>
        </div>

      </div>

    </div>
  );
}
