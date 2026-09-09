import { calculateBalances, formatCurrency, getInitials, mockEvents } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

/**
 * La prueba de producto del hero: la pantalla de saldos, que es la que
 * responde la pregunta del pitch —quien le tiene que pagar a quien, y cuanto—.
 *
 * Se calcula con `calculateBalances` sobre los mismos datos mock que usa el
 * resto del prototipo, no es una captura: si cambian los gastos de ejemplo,
 * cambia sola. Es tambien lo que muestra el codigo de color del producto,
 * verde para el que recibe y violeta para el que debe.
 */
export function LandingBalanceCard() {
  const event = mockEvents[0]
  const balances = calculateBalances(event)
    .slice()
    .sort((a, b) => b.netBalance - a.netBalance)

  return (
    <div className="w-full max-w-[380px] shrink-0 rounded-[24px] border border-[#e8ecf2] bg-white p-5 shadow-[0_18px_50px_rgba(7,27,58,0.12)]">
      <div className="mb-4">
        <p className="text-[15px] font-black text-[#071b3a]">Saldo por integrante</p>
        <p className="text-[12px] text-[#7b8494]">{event.name}</p>
      </div>

      <div className="flex flex-col gap-2">
        {balances.map((balance) => {
          const status =
            balance.netBalance > 0 ? 'recibe' : balance.netBalance < 0 ? 'debe' : 'en cero'

          return (
            <div key={balance.participantId} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef3f8] text-[12px] font-black text-[#071b3a]">
                {getInitials(balance.participantName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-black text-[#071b3a]">
                  {balance.participantName}
                </p>
                <span
                  className={cn(
                    'mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black',
                    status === 'recibe' && 'bg-[#e8faf5] text-[#21b894]',
                    status === 'debe' && 'bg-[#f0e9ff] text-[#8b5cf6]',
                    status === 'en cero' && 'bg-[#eef3f8] text-[#7b8494]',
                  )}
                >
                  {status}
                </span>
              </div>
              <p
                className={cn(
                  'shrink-0 text-[13px] font-black',
                  balance.netBalance > 0 && 'text-[#21b894]',
                  balance.netBalance < 0 && 'text-[#8b5cf6]',
                  balance.netBalance === 0 && 'text-[#071b3a]',
                )}
              >
                {balance.netBalance > 0 ? '+' : ''}
                {formatCurrency(balance.netBalance, event.currency)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
