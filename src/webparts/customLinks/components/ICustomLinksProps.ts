import type { WebPartContext } from "@microsoft/sp-webpart-base"

export interface LinkItem {
  title: string
  url: string
  icon?: string
  disabled?: boolean
}

export type LayoutType = "compact" | "filmstrip" | "grid" | "button" | "list" | "tiles"

export interface ICustomLinksProps {
  links: LinkItem[]
  defaultColor: string
  hoverColor: string
  cardColor: string
  cardHoverColor: string
  context: WebPartContext
  onUpdateLinks: (links: LinkItem[]) => void
  isEditMode?: boolean
  layout: LayoutType
  showIcons: boolean
  showTitles: boolean
  title: string
  titleColor: string
  titleFontSize: string
  borderRadius: string
}
