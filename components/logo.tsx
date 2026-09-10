/**
 * Marca de SplitIt: la placa verde con "Split" encima y el "It" saliendose
 * hacia la derecha. Nacio dentro del AppShell y se saco aca cuando la landing
 * necesito el mismo logo con otra barra alrededor.
 */
export function Logo() {
  return (
    <div className="relative h-[34px] w-[74px]">
      <div className="absolute left-0 top-0 h-[34px] w-[57px] rounded-[8px] bg-primary" />
      <div className="absolute left-[calc(50%+1px)] top-[3px] flex -translate-x-1/2 items-center justify-center whitespace-nowrap text-[24px] font-extrabold leading-[1.15]">
        <span className="text-[#fcfcfe]">Split</span>
        <span className="text-black">It</span>
      </div>
    </div>
  )
}
