import LoadingState from '../../components/common/LoadingState'

export default function LoadingPage() {
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <LoadingState title="Cargando OptiAcademic..." text="Validando sesion y preparando la vista." />
        </div>
    )
}

