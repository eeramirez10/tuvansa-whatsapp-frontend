export const normalizeFileKey = (value: string) => value.trim().replace(/^['"]|['"]$/g, '')

export const isPdf = (fileName: string, url?: string) => {
  const source = `${fileName} ${url ?? ''}`
  return /\.pdf(\?|$|\s|"|')/i.test(source)
}

export const isExcel = (fileName: string, url?: string) => {
  const source = `${fileName} ${url ?? ''}`
  return /\.(xlsx|xls|csv)(\?|$|\s|"|')/i.test(source)
}
