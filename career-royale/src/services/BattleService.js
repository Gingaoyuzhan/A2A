import { reactive } from 'vue'

const API_BASE = 'http://localhost:4000/api'

class BattleService {
    constructor() {
        this.state = reactive({
            battleId: null,
            interviewerHP: 100,
            candidateHP: 100,
            round: 1,
            messages: [],
            isBattleActive: false,
            resume: '',
            jd: '',
            mode: 'hard',
            damageEvent: null, // 'candidate' | 'interviewer' | null
            turboMode: false,
            result: null // 战斗结果
        })

        this.eventSource = null
    }

    /**
     * 初始化战斗状态
     */
    init(resume, jd, mode) {
        this.state.resume = resume
        this.state.jd = jd
        this.state.mode = mode
        this.state.messages = []
        this.state.round = 1
        this.state.interviewerHP = 100
        this.state.candidateHP = 100
        this.state.isBattleActive = true
        this.state.battleId = null
        this.state.result = null
    }

    /**
     * 开始战斗 - 调用后端 API
     */
    async startBattle() {
        try {
            // 1. 创建战斗
            const response = await fetch(`${API_BASE}/battle/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume: this.state.resume,
                    jd: this.state.jd,
                    mode: this.state.mode
                })
            })

            const result = await response.json()
            if (result.code !== 200) {
                throw new Error(result.message)
            }

            this.state.battleId = result.data.battleId
            console.log('[Battle] Created:', this.state.battleId)

            // 2. 连接 SSE 流
            return this.connectStream()
        } catch (error) {
            console.error('[Battle] Start failed:', error)
            this.state.isBattleActive = false
            throw error
        }
    }

    /**
     * 连接 SSE 事件流
     */
    connectStream() {
        return new Promise((resolve, reject) => {
            const url = `${API_BASE}/battle/${this.state.battleId}/stream`
            this.eventSource = new EventSource(url)

            // 战斗开始
            this.eventSource.addEventListener('battle_start', (e) => {
                const data = JSON.parse(e.data)
                this.addMessage('interviewer', data.data.message, true)
            })

            // 面试官提问
            this.eventSource.addEventListener('interviewer_attack', (e) => {
                const data = JSON.parse(e.data)
                this.state.round = data.data.round
                this.addMessage('interviewer', data.data.message, true)
            })

            // 候选人回答
            this.eventSource.addEventListener('candidate_defend', (e) => {
                const data = JSON.parse(e.data)
                this.addMessage('candidate', data.data.message, true)
            })

            // 伤害事件
            this.eventSource.addEventListener('damage', (e) => {
                const data = JSON.parse(e.data)
                this.state.damageEvent = data.data.target
                this.state.interviewerHP = data.data.hp.interviewer
                this.state.candidateHP = data.data.hp.candidate

                // 短暂显示伤害效果后清除
                setTimeout(() => {
                    this.state.damageEvent = null
                }, this.state.turboMode ? 50 : 500)
            })

            // 回合结束
            this.eventSource.addEventListener('round_end', (e) => {
                const data = JSON.parse(e.data)
                this.state.interviewerHP = data.data.hp.interviewer
                this.state.candidateHP = data.data.hp.candidate
            })

            // 战斗结束
            this.eventSource.addEventListener('battle_end', (e) => {
                const data = JSON.parse(e.data)
                this.state.result = data.data.result
                this.state.isBattleActive = false
                this.eventSource.close()
                resolve(this.state.result)
            })

            // 错误处理
            this.eventSource.addEventListener('error', (e) => {
                console.error('[Battle] SSE error:', e)
                this.eventSource.close()
                this.state.isBattleActive = false
                reject(new Error('战斗连接中断'))
            })
        })
    }

    /**
     * 添加消息
     */
    addMessage(sender, text, isTyping) {
        this.state.messages.push({
            id: Date.now(),
            sender,
            text,
            isTyping
        })
    }

    /**
     * 停止战斗
     */
    stopBattle() {
        if (this.eventSource) {
            this.eventSource.close()
            this.eventSource = null
        }
        this.state.isBattleActive = false
    }

    /**
     * 获取战斗结果
     */
    getResult() {
        return this.state.result
    }
}

export const battleService = new BattleService()
