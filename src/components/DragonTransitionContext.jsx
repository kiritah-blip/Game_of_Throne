import { createContext, useContext } from 'react'

/**
 * Contexte partagé pour toutes les transitions inter-pages.
 *
 * Valeurs exposées par App_v2 :
 *   triggerDragon    / cancelDragon    / dragonActive
 *   triggerMonde     / cancelMonde     / mondeActive
 *   triggerMaison    / cancelMaison    / maisonActive
 *   triggerPersonnage / cancelPersonnage / personnageActive
 *   triggerHistoire  / cancelHistoire  / histoireActive
 */
export const DragonTransitionContext = createContext(null)

export const useDragonTransition = () => useContext(DragonTransitionContext)
