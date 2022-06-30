import { useEffect, useRef } from "react";

export function useEffectUpdate(cb: Function, dependencies: any[]) {
  const updated = useRef(false);
  useEffect(() => {
    !updated.current ? (updated.current = true) : cb();

    // eslint-disable-next-line
  }, [...dependencies]);
}
