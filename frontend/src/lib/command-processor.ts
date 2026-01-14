import type { TerminalMessage } from "@/types/message";

// 命令上下文
export interface CommandContext {
  userIp?: string;
}

// 虚拟文件系统
const FILE_SYSTEM: Record<string, { content: string; type: 'file' | 'folder' }> = {
  'README.md': {
    content: `# Yi Wang
Full Stack Agent Engineer

Focusing on RAG & AI Agent systems with Java/Spring backend.
Building intelligent interfaces that bridge human and machine communication.

Location: Digital Space
Status: Online
`,
    type: 'file'
  },
  'resume.pdf': {
    content: '>> Initiating download sequence for resume...',
    type: 'file'
  },
  'contact.sh': {
    content: '>> Opening secure contact channel...',
    type: 'file'
  },
  '.secrets': {
    content: `
═══════════════════════════════════════════════════════
  🔐 TOP SECRET // AUTHORIZED PERSONNEL ONLY
═══════════════════════════════════════════════════════

  [LEVEL 1] The answer to everything: 42
  [LEVEL 2] Best framework: Spring Boot
  [LEVEL 3] Coffee consumption: ∞

  ACCESS LOGGED: You found the Easter egg! 🎉
═══════════════════════════════════════════════════════
`,
    type: 'file'
  },
  'projects': {
    content: 'drwxr-xr-x  projects/',
    type: 'folder'
  },
  'ai-agent.json': {
    content: JSON.stringify({
      name: "AI Agent Portfolio",
      tech: ["Next.js", "Spring Boot", "LangChain", "RAG"],
      status: "production"
    }, null, 2),
    type: 'file'
  },
  'portfolio.ts': {
    content: `
// The portfolio you're looking at right now
export const portfolio = {
  frontend: 'Next.js 16 + TypeScript',
  backend: 'Spring Boot 3.2 + Java 17',
  ai: 'LangChain + OpenAI',
  features: ['Real-time chat', 'RAG', 'Command system']
};
`,
    type: 'file'
  }
};

// 格式化的 ls 输出
const LIST_OUTPUT = `
drwxr-xr-x  user  staff   192 Jan 13 10:00 .
drwxr-xr-x  root  root    320 Jan 13 09:00 ..
-rw-r--r--  user  staff   420 Jan 14 12:00 README.md
-rwxr-xr-x  user  staff  2.4M Jan 10 15:30 resume.pdf
-rwxr-xr-x  user  staff   128 Jan 14 14:00 contact.sh
drwxr-xr-x  user  staff   --- Jan 01 00:00 projects/
-rw-r--r--  user  staff    64 Jan 15 09:30 .secrets
`;

// projects 目录内容
const PROJECTS_LIST = `
total 24
drwxr-xr-x  user  staff    64 Jan 15 09:30 .
drwxr-xr-x  root  root    320 Jan 13 09:00 ..
-rw-r--r--  user  staff   256 Jan 15 09:30 ai-agent.json
-rw-r--r--  user  staff   180 Jan 15 09:30 portfolio.ts
`;

/**
 * 处理本地命令
 * @param input 用户输入
 * @param context 命令上下文（包含用户IP等信息）
 * @returns 如果是本地命令，返回系统消息；否则返回 null
 */
export function processLocalCommand(input: string, context?: CommandContext): TerminalMessage | null {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // 创建系统消息
  const createSystemMsg = (content: string, status: 'completed' | 'error' = 'completed'): TerminalMessage => ({
    id: `sys-${Date.now()}-${Math.random()}`,
    role: 'system',
    content,
    status,
  });

  switch (command) {
    case 'help':
      return createSystemMsg(`
Available Commands:

  File Operations:
    ls, ll          List directory contents
    cat <file>      Display file content
    cd <dir>        Change directory (projects/)

  System Info:
    whoami          Display current user
    date            Show current date/time
    uname [-a]      System information

  Fun Commands:
    sudo <cmd>      Try to get admin access
    rm -rf /        Try to delete everything
    vi, vim, nano   Try to open editor
    clear           Clear terminal screen

  Examples:
    ls              List files in current directory
    ls projects/    List files in projects folder
    cat README.md   Show README content
    cat .secrets    Reveal hidden secrets
    whoami          Who are you?
    clear           Clear the terminal
`);

    case 'ls':
    case 'll':
      if (args[0] === 'projects/') {
        return createSystemMsg(PROJECTS_LIST.trim());
      }
      return createSystemMsg(LIST_OUTPUT.trim());

    case 'cat':
      if (args.length === 0) {
        return createSystemMsg('Usage: cat <filename>\n\nExamples: cat README.md, cat resume.pdf', 'error');
      }

      const filename = args[0];
      const file = FILE_SYSTEM[filename];

      if (file) {
        if (filename === 'contact.sh') {
          // 特殊标记，用于触发弹窗
          return createSystemMsg('CONTACT_MODAL_TRIGGER');
        }
        if (filename === 'resume.pdf') {
          // 特殊标记，用于触发下载
          return createSystemMsg('RESUME_DOWNLOAD_TRIGGER');
        }
        return createSystemMsg(file.content);
      }

      return createSystemMsg(`cat: ${filename}: No such file or directory\nType 'ls' to see available files.`, 'error');

    case 'cd':
      if (args.length === 0) {
        return createSystemMsg('cd: missing argument\nUsage: cd <directory>', 'error');
      }
      if (args[0] === 'projects/' || args[0] === 'projects') {
        return createSystemMsg('Changed to projects/ directory\nUse "ls" to see contents.');
      }
      if (args[0] === '..') {
        return createSystemMsg('Changed to parent directory (~/)');
      }
      return createSystemMsg(`cd: ${args[0]}: No such file or directory`, 'error');

    case 'whoami':
      // 使用真实的IP地址，如果有的话
      const displayIp = context?.userIp || `${Math.floor(Math.random() * 255)}.x.x.x`;
      return createSystemMsg(`visitor@${displayIp} (Guest User)\nSession: terminal-session-${Math.floor(Math.random() * 1000)}\nShell: zsh\nTerminal: cli-terminal-v1.0`);

    case 'date':
      return createSystemMsg(new Date().toUTCString() + '\nUTC timezone');

    case 'uname':
      if (args[0] === '-a') {
        return createSystemMsg('Linux digital-twin 5.15.0-generic #42-Ubuntu SMP PREEMPT x86_64 GNU/Linux');
      }
      return createSystemMsg('Linux');

    case 'sudo':
      return createSystemMsg(`\u203C\uFE0F SECURITY ALERT \u203C\uFE0F

user is not in the sudoers file. This incident has been reported.

[Yi Wang has been notified of this attempt]`);

    case 'rm':
      if (args.includes('-rf') && (args.includes('/') || args.includes('*'))) {
        return createSystemMsg(`\uD83D\uDEA8 CRITICAL ERROR \uD83D\uDEA8

PERMISSION DENIED
System Integrity Protection is enabled.

Nice try though! \uD83D\uDE09`);
      }
      return createSystemMsg('rm: cannot remove files in read-only filesystem.\nMode: read-only');

    case 'vi':
    case 'vim':
    case 'nano':
      return createSystemMsg(`\u274C Error: Cannot open display

(Trust me, you don't want to get stuck in Vim here.)
Try "cat <file>" to view file contents instead.`);

    case 'clear':
      // 返回特殊标记，让组件知道要清屏
      return createSystemMsg('CLEAR_SCREEN_TRIGGER');

    default:
      return null; // 不是本地命令，交给 AI 处理
  }
}

/**
 * 检查命令是否需要触发特殊操作
 */
export function getCommandAction(message: TerminalMessage): 'contact-modal' | 'resume-download' | 'clear-screen' | null {
  if (message.role !== 'system') return null;

  if (message.content === 'CONTACT_MODAL_TRIGGER') return 'contact-modal';
  if (message.content === 'RESUME_DOWNLOAD_TRIGGER') return 'resume-download';
  if (message.content === 'CLEAR_SCREEN_TRIGGER') return 'clear-screen';

  return null;
}
