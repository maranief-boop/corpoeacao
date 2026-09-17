
import { useState, useRef } from 'react'
import { Camera, Save, X, RotateCcw } from 'lucide-react'
import { Button, Input, Label } from './ui'

export default function ModalPerfil({ aluno, onSalvar, onFechar }) {
  const [telefone, setTelefone] = useState(aluno.telefone || '')
  const [fotoUrl, setFotoUrl] = useState(aluno.foto_url || '')
  const [capturando, setCapturando] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const iniciarCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      alert('Seu navegador não suporta acesso à câmera.')
      return
    }
    setCapturando(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (e) {
      alert('Não foi possível acessar a câmera: ' + e.message)
      setCapturando(false)
    }
  }

  const tirarFoto = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')
    setFotoUrl(dataUrl)
    setCapturando(false)
    const stream = video.srcObject
    stream.getTracks().forEach(track => track.stop())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 p-6 space-y-4 border border-white/10">
        <h2 className="text-lg font-bold text-white">Editar Perfil</h2>

        <Label>Telefone</Label>
        <Input className="!bg-black !text-white" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

        <div className="space-y-2">
          <Label>Foto do Perfil</Label>
          {fotoUrl && <img src={fotoUrl} className="w-24 h-24 rounded-full mx-auto" alt="Preview" />}

          <Button onClick={iniciarCamera} variante="secundario" className="w-full">
            <Camera className="mr-2" /> Tirar foto
          </Button>

          {capturando && (
            <div className="mt-2">
              <video ref={videoRef} autoPlay className="w-full rounded-lg" />
              <Button onClick={tirarFoto} className="w-full mt-2">Capturar</Button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2">
          <Button onClick={onFechar} variante="secundario" className="flex-1">Cancelar</Button>
          <Button onClick={() => onSalvar({ telefone, fotoUrl })} className="flex-1">Salvar</Button>
        </div>
      </div>
    </div>
  )
}
