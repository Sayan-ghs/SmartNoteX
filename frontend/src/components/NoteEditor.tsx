import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, Heading1, Heading2 } from 'lucide-react';

interface NoteEditorProps {
     content: string;
     onChange: (html: string) => void;
     readOnly?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ content, onChange, readOnly }) => {
     const editor = useEditor({
          extensions: [StarterKit],
          content: content,
          editable: !readOnly,
          onUpdate: ({ editor }) => {
               onChange(editor.getHTML());
          },
          editorProps: {
               attributes: {
                    class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4'
               }
          }
     });

     // Update content if changed externally (e.g. switching notes)
     useEffect(() => {
          if (editor && content !== editor.getHTML()) {
               editor.commands.setContent(content);
          }
     }, [content, editor]);

     if (!editor) {
          return null;
     }

     return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
               {/* Toolbar */}
               {!readOnly && (
                    <div className="flex items-center gap-2 p-2 border-b border-gray-100 bg-gray-50/50 rounded-t-xl overflow-x-auto">
                         <button
                              onClick={() => editor.chain().focus().toggleBold().run()}
                              className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                              title="Bold"
                         >
                              <Bold className="h-4 w-4" />
                         </button>
                         <button
                              onClick={() => editor.chain().focus().toggleItalic().run()}
                              className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                              title="Italic"
                         >
                              <Italic className="h-4 w-4" />
                         </button>
                         <div className="w-px h-6 bg-gray-300 mx-1"></div>
                         <button
                              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                              className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                              title="H1"
                         >
                              <Heading1 className="h-4 w-4" />
                         </button>
                         <button
                              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                              className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                              title="H2"
                         >
                              <Heading2 className="h-4 w-4" />
                         </button>
                         <button
                              onClick={() => editor.chain().focus().toggleBulletList().run()}
                              className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                              title="Bullet List"
                         >
                              <List className="h-4 w-4" />
                         </button>
                    </div>
               )}

               {/* Editor Area */}
               <div className="flex-1 overflow-y-auto">
                    <EditorContent editor={editor} />
               </div>
          </div>
     );
};
