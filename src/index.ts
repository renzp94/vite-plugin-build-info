import { getBranchName, getFirstCommitHash8, utcToGmt } from './utils'

export interface BuildInfo {
  name: string
  version: string
  branchName: string
  firstCommitHash8: string
  time: string
}

export interface Options {
  showName?: boolean
  showVersion?: boolean
  nameBlockColor?: string
  showTime?: boolean
  timeBlockColor?: string
  showGit?: boolean
  gitBlockColor?: string
}

const yellow = (str: string) => {
  const start = 33
  const end = 39
  const open = `\x1b[${start}m`
  const close = `\x1b[${end}m`
  const regex = new RegExp(`\\x1b\\[${end}m`, 'g')
  return open + str.replace(regex, open) + close
}

const padStartZero = (num: number) => num.toString().padStart(2, '0')

const pluginName = 'renzp:vite-plugin-build-info'

const getBuildInfo = async (root: string, options?: Options) => {
  let htmlHeadCloseTag = '</head>'
  try {
    const {
      showName = true,
      showVersion = true,
      nameBlockColor = '#4170FF',
      showTime = true,
      timeBlockColor = '#09b987',
      showGit = true,
      gitBlockColor = '#e19c0e',
    } = options ?? {}

    const pkg = require(`${root}/package.json`)
    const branchName = await getBranchName(root)
    const firstCommitHash8 = await getFirstCommitHash8(root)

    const date = utcToGmt(new Date())
    const time = `${date.getFullYear()}-${padStartZero(
      date.getMonth() + 1,
    )}-${padStartZero(date.getDate())} ${padStartZero(
      date.getHours(),
    )}:${padStartZero(date.getMinutes())}:${padStartZero(date.getSeconds())}`
    const buildInfo: BuildInfo = {
      name: pkg?.name || pluginName,
      version: pkg?.version || '',
      branchName,
      firstCommitHash8,
      time,
    }

    const isShowGit = showGit && (branchName || firstCommitHash8)

    const msg =
      (showName || showVersion ? '%c' : '') +
      (showName ? buildInfo.name : '') +
      (showVersion ? ` v${buildInfo.version}` : '') +
      (showTime ? `%c${buildInfo.time}` : '') +
      (isShowGit
        ? `%c${buildInfo.branchName} ${buildInfo.firstCommitHash8}`
        : '')
    const nameBlock = `background: ${nameBlockColor}; color: #fff; padding: 2px 4px; border-radius: 3px 0 0 3px;`
    const timeBlock = `background: ${timeBlockColor}; color: #fff; padding: 2px 4px;margin-right: -1px;`
    const gitBlock = `background: ${gitBlockColor}; color: #fff; padding: 2px 4px; border-radius: 0 3px 3px 0;`

    const logInfo = `'${msg}'${
      showName || showVersion ? `,'${nameBlock}'` : ''
    }${showTime ? `,'${timeBlock}'` : ''}${isShowGit ? `,'${gitBlock}'` : ''}`

    htmlHeadCloseTag = `<script type="text/javascript">var VITE_BUILD_INFO=${JSON.stringify(
      buildInfo,
    )}; console.log(${logInfo});</script></head>`
  } catch (err: any) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(
      `${yellow(`WARNING[${pluginName}]: `)}${err.message.split('\n')[0]}`,
    )
  }

  return htmlHeadCloseTag
}

const plugin = (options?: Options) => {
  const root = process.cwd()
  let htmlHeadCloseTag = ''

  return {
    name: pluginName,
    async buildStart() {
      htmlHeadCloseTag = await getBuildInfo(root, options)
    },
    async transformIndexHtml(html) {
      return html.replace('</head>', htmlHeadCloseTag)
    },
  }
}

export default plugin
