"use client"

import * as React from "react"
import styles from "./CustomLinks.module.scss"
import type { ICustomLinksProps } from "./ICustomLinksProps"
import { FilePicker, type IFilePickerResult } from "@pnp/spfx-controls-react/lib/FilePicker"
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react"

interface LinkItem {
  url?: string
  title?: string
  icon?: string
  disabled?: boolean
}

const CustomLinks: React.FC<ICustomLinksProps> = ({
  links,
  defaultColor,
  hoverColor,
  cardColor,
  cardHoverColor,
  context,
  onUpdateLinks,
  isEditMode = false,
  layout = "tiles",
  showIcons = true,
  showTitles = true,
  title = "",
  titleColor = "#323130",
  titleFontSize = "21",
  borderRadius = "12",
}) => {
  const [editIndex, setEditIndex] = React.useState<number | null>(null)
  const [svgContents, setSvgContents] = React.useState<{ [key: string]: string }>({})

  // Function to fetch and cache SVG content
  const fetchSvgContent = async (url: string): Promise<string> => {
    if (svgContents[url]) {
      return svgContents[url]
    }

    try {
      const response = await fetch(url)
      const svgText = await response.text()
      setSvgContents((prev) => ({ ...prev, [url]: svgText }))
      return svgText
    } catch (error) {
      console.error("Failed to fetch SVG:", error)
      return ""
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    const cardElement = e.currentTarget

    // Handle SVG color change on hover
    const svgElements = cardElement.querySelectorAll("svg")
    svgElements.forEach((svg) => {
      const paths = svg.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline")
      paths.forEach((path) => {
        const element = path as SVGElement
        // Store original colors if not already stored
        if (!element.dataset.originalFill) {
          element.dataset.originalFill = element.getAttribute("fill") || ""
        }
        if (!element.dataset.originalStroke) {
          element.dataset.originalStroke = element.getAttribute("stroke") || ""
        }
        // Apply hover color
        if (element.getAttribute("fill") && element.getAttribute("fill") !== "none") {
          element.setAttribute("fill", hoverColor)
        }
        if (element.getAttribute("stroke") && element.getAttribute("stroke") !== "none") {
          element.setAttribute("stroke", hoverColor)
        }
      })
    })

    if (layout === "grid" || layout === "filmstrip") {
      const titleElement = cardElement.querySelector(`.${layout === "grid" ? styles.title : styles.filmstripTitle}`)
      if (titleElement) {
        (titleElement as HTMLElement).style.color = hoverColor
      }

      const iconContainer = cardElement.querySelector(
        `.${layout === "grid" ? styles.iconContainer : styles.filmstripIconContainer}`,
      )
      if (iconContainer) {
        (iconContainer as HTMLElement).style.backgroundColor = cardHoverColor
      }

      if (titleElement) {
        (titleElement as HTMLElement).style.backgroundColor = cardHoverColor
      }
    } else {
      cardElement.style.color = hoverColor
      cardElement.style.backgroundColor = cardHoverColor
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    const cardElement = e.currentTarget

    // Reset SVG color on mouse leave
    const svgElements = cardElement.querySelectorAll("svg")
    svgElements.forEach((svg) => {
      const paths = svg.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline")
      paths.forEach((path) => {
        const element = path as SVGElement
        // Restore original colors
        if (element.dataset.originalFill !== undefined) {
          if (element.dataset.originalFill) {
            element.setAttribute("fill", element.dataset.originalFill)
          } else {
            element.removeAttribute("fill")
          }
        }
        if (element.dataset.originalStroke !== undefined) {
          if (element.dataset.originalStroke) {
            element.setAttribute("stroke", element.dataset.originalStroke)
          } else {
            element.removeAttribute("stroke")
          }
        }
      })
    })

    if (layout === "grid" || layout === "filmstrip") {
      // Reset the title color
      const titleElement = cardElement.querySelector(`.${layout === "grid" ? styles.title : styles.filmstripTitle}`)
      if (titleElement) {
        (titleElement as HTMLElement).style.color = defaultColor
      }

      // Reset the icon container background
      const iconContainer = cardElement.querySelector(
        `.${layout === "grid" ? styles.iconContainer : styles.filmstripIconContainer}`,
      )
      if (iconContainer) {
        (iconContainer as HTMLElement).style.backgroundColor = "#f8f9fa"
      }

      // Reset the title container background
      if (titleElement) {
        (titleElement as HTMLElement).style.backgroundColor = "#ffffff"
      }

      // Remove the entire card background reset for filmstrip - only reset specific parts like grid
    } else {
      cardElement.style.color = defaultColor
      cardElement.style.backgroundColor = cardColor
    }
  }

  const isImageUrl = (url: string | undefined): boolean => {
    if (!url) return false
    return /\.(svg|png|jpg|jpeg|gif|webp)$/i.test(url) || url.startsWith("data:image/")
  }

  const isSvgUrl = (url: string | undefined): boolean => {
    if (!url) return false
    return /\.svg$/i.test(url) || (url.startsWith("data:image/") && url.includes("svg"))
  }

  const onIconChange = async (filePickerResults: IFilePickerResult[]): Promise<void> => {
    if (editIndex === null || !filePickerResults || filePickerResults.length === 0) {
      console.log("No file selected or invalid edit index")
      return
    }

    try {
      const selectedFile = filePickerResults[0]
      const updatedLinks = [...links]

      let fileUrl: string | undefined

      if (selectedFile.fileAbsoluteUrl) {
        fileUrl = selectedFile.fileAbsoluteUrl
        console.log("Using fileAbsoluteUrl:", fileUrl)
      } else if (selectedFile.spItemUrl) {
        fileUrl = selectedFile.spItemUrl
        console.log("Using spItemUrl:", fileUrl)
      } else if (selectedFile.downloadFileContent) {
        try {
          const fileBlob = await selectedFile.downloadFileContent()
          const reader = new FileReader()

          fileUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(fileBlob)
          })

          console.log("Created base64 data URL")
        } catch (error) {
          console.error("Error creating data URL:", error)
          return
        }
      }

      if (fileUrl) {
        updatedLinks[editIndex].icon = fileUrl
        onUpdateLinks(updatedLinks)
        console.log("Icon updated successfully with URL type:", fileUrl.startsWith("data:") ? "base64" : "direct URL")
      } else {
        console.error("Could not get file URL from selected file")
        alert("Could not load the selected file. Please try a different file or upload method.")
      }
    } catch (error) {
      console.error("Error updating icon:", error)
      alert("Error updating icon. Please try again.")
    }

    setEditIndex(null)
  }

  const onFilePickerCancel = (): void => {
    setEditIndex(null)
  }

  const SvgIcon: React.FC<{ url: string; alt?: string }> = ({ url, alt }) => {
    const [svgContent, setSvgContent] = React.useState<string>("")

    React.useEffect(() => {
      if (isSvgUrl(url)) {
        fetchSvgContent(url)
          .then((content) => {
            // Process SVG content to remove existing width/height and ensure proper scaling
            let processedSvg = content

            // Remove existing width and height attributes
            processedSvg = processedSvg.replace(/width="[^"]*"/gi, "")
            processedSvg = processedSvg.replace(/height="[^"]*"/gi, "")

            // Add our own width/height to fill container
            processedSvg = processedSvg.replace(/<svg/, '<svg width="100%" height="100%"')

            // Ensure viewBox exists for proper scaling
            if (!processedSvg.includes("viewBox")) {
              // Try to extract original dimensions for viewBox
              const originalContent = content
              const widthMatch = originalContent.match(/width="([^"]*)"/)
              const heightMatch = originalContent.match(/height="([^"]*)"/)

              if (widthMatch && heightMatch) {
                const width = widthMatch[1].replace(/px|pt|em|rem/gi, "")
                const height = heightMatch[1].replace(/px|pt|em|rem/gi, "")
                processedSvg = processedSvg.replace(/<svg/, `<svg viewBox="0 0 ${width} ${height}"`)
              } else {
                // Default viewBox if we can't determine original dimensions
                processedSvg = processedSvg.replace(/<svg/, '<svg viewBox="0 0 24 24"')
              }
            }

            setSvgContent(processedSvg)
          })
          .catch((error) => {
            console.error("Failed to load SVG content:", error)
            setSvgContent("")
          })
      }
    }, [url])

    if (!svgContent) {
      return (
        <div className={styles.svgIconContainer}>
          <span className={styles.icon}>🖼️</span>
        </div>
      )
    }

    return (
      <div className={styles.svgIconContainer}>
        <div className={styles.svgIcon} dangerouslySetInnerHTML={{ __html: svgContent }} />
      </div>
    )
  }

  const renderIcon = (link: LinkItem, index: number): React.ReactElement => {
    if (link.icon) {
      if (isSvgUrl(link.icon)) {
        return <SvgIcon url={link.icon} alt={link.title} />
      } else if (isImageUrl(link.icon) || link.icon.startsWith("data:")) {
        return (
          <img
            src={link.icon || "/placeholder.svg"}
            alt={link.title}
            className={styles.iconImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              console.error("Image failed to load:", link.icon)
              target.style.display = "none"
              const fallback = document.createElement("span")
              fallback.textContent = "🖼️"
              fallback.className = styles.icon
              target.parentNode?.appendChild(fallback)
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", link.icon?.substring(0, 50) + "...")
            }}
          />
        )
      } else {
        return <span className={styles.icon}>{link.icon}</span>
      }
    } else {
      return <span className={styles.icon}>🌐</span>
    }
  }

  const renderLink = (link: LinkItem, index: number): React.ReactElement => {
    const linkContent = (
      <>
        {showIcons && (layout === "tiles" || layout === "grid" || layout === "compact") && (
          <div className={styles.iconContainer}>{renderIcon(link, index)}</div>
        )}
        {showIcons && layout === "filmstrip" && <div className={styles.filmstripIcon}>{renderIcon(link, index)}</div>}
        {showIcons && (layout === "list" || layout === "button") && link.icon && (
          <div className={styles.inlineIcon}>{renderIcon(link, index)}</div>
        )}
        {showTitles && <div className={styles.title}>{link.title}</div>}
      </>
    )

    const cardStyle: React.CSSProperties = {
      color: defaultColor,
      backgroundColor: cardColor,
    }

    // Apply border radius only for tiles and button layouts
    if (layout === "tiles" || layout === "button" || layout === "list") {
      cardStyle.borderRadius = borderRadius
    }

    return (
      <a
        href={link.disabled ? undefined : link.url}
        className={`${styles.linkCard} ${styles[layout]} ${link.disabled ? styles.disabled : ""} ${
          !showIcons ? styles.noIcon : ""
        } ${!showTitles ? styles.noTitle : ""}`}
        style={cardStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        target="_blank"
        rel="noopener noreferrer"
      >
        {linkContent}
      </a>
    )
  }

  const [currentPage, setCurrentPage] = React.useState<number>(0)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [dragStart, setDragStart] = React.useState<number>(0)
  const [dragOffset, setDragOffset] = React.useState<number>(0)

  const itemsPerPage = 3
  const totalPages = Math.ceil(links.length / itemsPerPage)

  const handlePrevPage = (): void => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  }

  const handleNextPage = (): void => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
  }

  const handleDotClick = (pageIndex: number): void => {
    setCurrentPage(pageIndex)
  }

  const handleMouseDown = (e: React.MouseEvent): void => {
    if (layout === "filmstrip") {
      setIsDragging(true)
      setDragStart(e.clientX)
    }
  }

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (isDragging && layout === "filmstrip") {
      const diff = e.clientX - dragStart
      setDragOffset(diff)
    }
  }

  const handleMouseUp = (): void => {
    if (isDragging && layout === "filmstrip") {
      if (Math.abs(dragOffset) > 50) {
        if (dragOffset > 0) {
          handlePrevPage()
        } else {
          handleNextPage()
        }
      }
      setIsDragging(false)
      setDragOffset(0)
    }
  }

  if (layout === "filmstrip") {
    return (
      <div className={styles.webPartContainer}>
        {title && title.trim() && (
          <h2 className={styles.webPartTitle} style={{ color: titleColor, fontSize: titleFontSize }}>
            {title}
          </h2>
        )}
        <div className={`${styles.container} ${styles.filmstripContainer}`}>
          <div className={styles.carouselWrapper}>
            <button
              className={styles.navButton}
              onClick={handlePrevPage}
              disabled={totalPages <= 1}
              aria-label="Previous page"
            >
              ←
            </button>

            <div className={styles.carouselViewport}>
              <div
                className={styles.carouselTrack}
                style={{
                  transform: `translateX(-${currentPage * 100}%)`,
                  transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {Array.from({ length: totalPages }, (_, pageIndex) => {
                  const pageStartIndex = pageIndex * itemsPerPage
                  const pageEndIndex = pageStartIndex + itemsPerPage
                  const pageItems = links.slice(pageStartIndex, pageEndIndex)

                  return (
                    <div key={pageIndex} className={styles.carouselPage}>
                      <div className={styles.filmstripGrid}>
                        {pageItems.map((link, index) => (
                          <div key={pageStartIndex + index} className={styles.linkWrapper}>
                            <a
                              href={link.disabled ? undefined : link.url}
                              className={`${styles.linkCard} ${styles.filmstripCard} ${link.disabled ? styles.disabled : ""}`}
                              style={{ color: defaultColor, backgroundColor: "#ffffff" }}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className={styles.filmstripIconContainer}>
                                {renderIcon(link, pageStartIndex + index)}
                              </div>
                              {showTitles && <div className={styles.filmstripTitle}>{link.title}</div>}
                            </a>

                            {isEditMode && (
                              <>
                                <div style={{ marginTop: "8px" }}>
                                  <PrimaryButton
                                    text="Edit Icon"
                                    onClick={() => setEditIndex(pageStartIndex + index)}
                                    disabled={editIndex !== null}
                                  />
                                  {editIndex === pageStartIndex + index && (
                                    <DefaultButton
                                      text="Cancel"
                                      onClick={() => setEditIndex(null)}
                                      style={{ marginLeft: "8px" }}
                                    />
                                  )}
                                </div>

                                {editIndex === pageStartIndex + index && (
                                  <div
                                    style={{
                                      marginTop: "12px",
                                      padding: "12px",
                                      border: "1px solid #ccc",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    <FilePicker
                                      context={context}
                                      onSave={onIconChange}
                                      onCancel={onFilePickerCancel}
                                      buttonLabel="Select Icon File"
                                      hideRecentTab={false}
                                      hideStockImages={true}
                                      hideWebSearchTab={false}
                                      hideOrganisationalAssetTab={false}
                                      hideLinkUploadTab={false}
                                      hideLocalUploadTab={false}
                                      accepts={[".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"]}
                                      storeLastActiveTab={true}
                                      includePageLibraries={true}
                                      checkIfFileExists={false}
                                      itemsCountQueryLimit={100}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              className={styles.navButton}
              onClick={handleNextPage}
              disabled={totalPages <= 1}
              aria-label="Next page"
            >
              →
            </button>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`${styles.paginationDot} ${index === currentPage ? styles.active : ""}`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.webPartContainer}>
      {title && title.trim() && (
        <h2 className={styles.webPartTitle} style={{ color: titleColor, fontSize: titleFontSize }}>
          {title}
        </h2>
      )}
      <div className={`${styles.container} ${styles[`${layout}Container`]}`}>
        {links.map((link, index) => (
          <div key={index} className={styles.linkWrapper}>
            {renderLink(link, index)}

            {isEditMode && (
              <>
                <div style={{ marginTop: "8px" }}>
                  <PrimaryButton text="Edit Icon" onClick={() => setEditIndex(index)} disabled={editIndex !== null} />
                  {editIndex === index && (
                    <DefaultButton text="Cancel" onClick={() => setEditIndex(null)} style={{ marginLeft: "8px" }} />
                  )}
                </div>

                {editIndex === index && (
                  <div style={{ marginTop: "12px", padding: "12px", border: "1px solid #ccc", borderRadius: "4px" }}>
                    <FilePicker
                      context={context}
                      onSave={onIconChange}
                      onCancel={onFilePickerCancel}
                      buttonLabel="Select Icon File"
                      hideRecentTab={false}
                      hideStockImages={true}
                      hideWebSearchTab={false}
                      hideOrganisationalAssetTab={false}
                      hideLinkUploadTab={false}
                      hideLocalUploadTab={false}
                      accepts={[".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"]}
                      storeLastActiveTab={true}
                      includePageLibraries={true}
                      checkIfFileExists={false}
                      itemsCountQueryLimit={100}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomLinks
