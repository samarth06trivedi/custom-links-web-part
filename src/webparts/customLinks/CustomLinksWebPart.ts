import * as React from "react"
import * as ReactDom from "react-dom"
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base"
import { DisplayMode } from "@microsoft/sp-core-library"
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  type IPropertyPaneDropdownOption,
} from "@microsoft/sp-property-pane"

import CustomLinks from "./components/CustomLinks"
import type { ICustomLinksProps, LinkItem, LayoutType } from "./components/ICustomLinksProps"
import {
  PropertyFieldCollectionData,
  CustomCollectionFieldType,
} from "@pnp/spfx-property-controls/lib/PropertyFieldCollectionData"

export interface ICustomLinksWebPartProps {
  defaultColor: string
  hoverColor: string
  cardColor: string
  cardHoverColor: string
  links: LinkItem[]
  layout: LayoutType
  showIcons: boolean
  showTitles: boolean
  title: string
  titleColor: string
  titleFontSize: string
  borderRadius: string
}

export default class CustomLinksWebPart extends BaseClientSideWebPart<ICustomLinksWebPartProps> {
  private formatUrl(url: string): string {
    if (!url) return url

    // Trim whitespace
    url = url.trim()

    // If URL already has a protocol, return as is
    if (/^https?:\/\//i.test(url)) {
      return url
    }

    // If URL starts with //, add https:
    if (url.startsWith("//")) {
      return `https:${url}`
    }

    // If URL looks like a domain (contains a dot and no spaces), add https://
    if (url.includes(".") && !url.includes(" ") && !url.startsWith("/")) {
      return `https://${url}`
    }

    // For relative URLs or other cases, return as is
    return url
  }

  private formatLinks(links: LinkItem[]): LinkItem[] {
    return (links || []).map((link) => ({
      ...link,
      url: this.formatUrl(link.url || ""),
    }))
  }

  public render(): void {
    const formattedLinks = this.formatLinks(this.properties.links)

    // Format titleFontSize and borderRadius to add "px" if they're just numbers
    const formatPixelValue = (value: string | undefined): string => {
      if (!value) return ""
      // If the value is just a number (no letters), add "px"
      if (/^\d+$/.test(value)) {
        return `${value}px`
      }
      return value
    }

    const element: React.ReactElement<ICustomLinksProps> = React.createElement(CustomLinks, {
      links: formattedLinks,
      defaultColor: this.properties.defaultColor || "#333333",
      hoverColor: this.properties.hoverColor || "#0078d4",
      cardColor: this.properties.cardColor || "#f3f2f1",
      cardHoverColor: this.properties.cardHoverColor || "#e1dfdd",
      context: this.context,
      onUpdateLinks: (updatedLinks: LinkItem[]) => {
        this.properties.links = this.formatLinks(updatedLinks)
        this.render()
      },
      isEditMode: this.displayMode === DisplayMode.Edit,
      layout: this.properties.layout || "tiles",
      showIcons: this.properties.showIcons !== false,
      showTitles: this.properties.showTitles !== false,
      title: this.properties.title || "",
      titleColor: this.properties.titleColor || "#323130",
      titleFontSize: formatPixelValue(this.properties.titleFontSize) || "21px",
      borderRadius: formatPixelValue(this.properties.borderRadius) || "12px",
    })

    ReactDom.render(element, this.domElement)
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement)
  }

  protected onPropertyPaneFieldChanged(
    propertyPath: string,
    oldValue: LinkItem[] | unknown,
    newValue: LinkItem[] | unknown,
  ): void {
    if (propertyPath === "links" && Array.isArray(newValue)) {
      this.properties.links = this.formatLinks(newValue as LinkItem[])
      this.render()
    }
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue)
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const layoutOptions: IPropertyPaneDropdownOption[] = [
      { key: "tiles", text: "Tiles" },
      { key: "grid", text: "Grid" },
      { key: "compact", text: "Compact" },
      { key: "filmstrip", text: "Filmstrip" },
      { key: "list", text: "List" },
      { key: "button", text: "Button" },
    ]

    const currentLayout = this.properties.layout || "tiles"
    const showBorderRadiusField = currentLayout === "button" || currentLayout === "tiles" || currentLayout === "list"

    const styleFields = [
      PropertyPaneTextField("defaultColor", {
        label: "Text Color",
        placeholder: "#333333",
      }),
      PropertyPaneTextField("hoverColor", {
        label: "Hover Color",
        placeholder: "#0078d4",
      }),
      PropertyPaneTextField("cardColor", {
        label: "Card Background Color",
        placeholder: "#f3f2f1",
      }),
      PropertyPaneTextField("cardHoverColor", {
        label: "Card Hover Background Color",
        placeholder: "#e1dfdd",
      }),
    ]

    if (showBorderRadiusField) {
      styleFields.push(
        PropertyPaneTextField("borderRadius", {
          label: "Border Radius",
          placeholder: "12",
          value: this.properties.borderRadius,
        }),
      )
    }

    return {
      pages: [
        {
          header: { description: "Custom Link Configuration" },
          groups: [
            {
              groupName: "Title",
              groupFields: [
                PropertyPaneTextField("title", {
                  label: "Web part title",
                  placeholder: "Enter title",
                  value: this.properties.title,
                }),
                PropertyPaneTextField("titleColor", {
                  label: "Title text color",
                  placeholder: "#323130",
                  value: this.properties.titleColor,
                }),
                PropertyPaneTextField("titleFontSize", {
                  label: "Title font size",
                  placeholder: "21",
                  value: this.properties.titleFontSize,
                }),
              ],
            },
            {
              groupName: "Layout",
              groupFields: [
                PropertyPaneDropdown("layout", {
                  label: "Layout Style",
                  options: layoutOptions,
                  selectedKey: this.properties.layout || "tiles",
                }),
              ],
            },
            {
              groupName: "Display Options",
              groupFields: [
                PropertyPaneToggle("showIcons", {
                  label: "Show icons in layout",
                  checked: this.properties.showIcons !== false,
                  onText: "Yes",
                  offText: "No",
                }),
                PropertyPaneToggle("showTitles", {
                  label: "Show titles",
                  checked: this.properties.showTitles !== false,
                  onText: "On",
                  offText: "Off",
                }),
              ],
            },
            {
              groupName: "Colors",
              groupFields: styleFields,
            },
            {
              groupName: "Links",
              groupFields: [
                PropertyFieldCollectionData("links", {
                  key: "links",
                  label: "Add or Edit Links",
                  panelHeader: "Manage Links",
                  manageBtnLabel: "Manage Links",
                  value: this.properties.links,
                  fields: [
                    {
                      id: "title",
                      title: "Title",
                      type: CustomCollectionFieldType.string,
                      required: true,
                    },
                    {
                      id: "url",
                      title: "URL",
                      type: CustomCollectionFieldType.string,
                      required: true,
                    },
                    {
                      id: "icon",
                      title: "Icon",
                      type: CustomCollectionFieldType.string,
                      required: false,
                    },
                    {
                      id: "disabled",
                      title: "Disabled",
                      type: CustomCollectionFieldType.boolean,
                      required: false,
                    },
                  ],
                  disabled: false,
                }),
              ],
            },
          ],
        },
      ],
    }
  }
}
