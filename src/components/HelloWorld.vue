<template>
  <div class="hello">
    <h1>タスク管理</h1>
    <input type="text" v-model="task.text" /> <button @click="add">追加</button>
    <ul>
      <li v-if="status == 'active'">
        <strong>アクティブ</strong>
      </li>
      <li v-else>
        <span @click="changeStatus('active')">アクティブ</span>
      </li>
      <li v-if="status == 'done'">
        <strong>完了</strong>
      </li>
      <li v-else>
        <span @click="changeStatus('done')">完了</span>
      </li>
    </ul>
    <ul v-for="task in tasks" :key="task.objectId">
      <li>
        <input type="checkbox" v-model="task.done" @click="done(task, $event)" v-if="task.status == 'active'"/>
        {{ task.text }}
        <span v-if="task.status == 'done'" @click="destroy(task)"> (削除)</span>
      </li>
    </ul>
  </div>
</template>

<script>
import ncmb from '@/ncmb'
import Vue from 'vue'

const Task = ncmb.DataStore('Task');

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      allTasks: [],
      tasks: [],
      task: {
        text: null
      },
      status: 'active',
      queues: {
        add: [],
        done: [],
        delete: []
      }
    }
  },
  async created() {
    if (!ncmb.User.getCurrentUser()) {
      await ncmb.User.loginAsAnonymous();
    }
    await this.fetch();
    this.save();
  },
  methods: {
    async onlineFetch() {
      return await Task.fetchAll();
    },
    getCache() {
      const str = localStorage.getItem('tasks');
      let tasks = str ? JSON.parse(str) : {};
      tasks = this.jsonToClass(tasks || []);
      return tasks;
    },
    jsonToClass(tasks) {
      for (let i = 0; i < tasks.length; i += 1) {
        const data = tasks[i];
        const task = new Task;
        tasks[i] = task
          .set('objectId', data.objectId)
          .set('text', data.text)
          .set('status', data.status)
          .set('acl', this.getAcl())
      }
      return tasks;
    },
    async offlineFetch() {
      return this.getCache()[this.status];
    },
    async fetch() {
      this.allTasks = await (navigator.onLine ? this.onlineFetch() : this.offlineFetch());
      this.filter();
    },
    save() {
      localStorage.setItem('tasks', JSON.stringify(this.allTasks));
    },
    filter() {
      const status = this.status;
      Vue.set(this, 'tasks', this.allTasks.filter(task => task.status == status));
      this.save();
    },
    async changeStatus(status) {
      this.status = status;
      this.filter();
    },
    getAcl() {
      const acl = new ncmb.Acl();
      const user = ncmb.User.getCurrentUser();
      return acl
        .setUserReadAccess(user, true)
        .setUserWriteAccess(user, true);
    },
    addQueue(action, task) {
      this.queues[action].push(task);
      localStorage.setItem('queues', JSON.stringify(this.queues));
    },
    async add() {
      const text = this.task.text;
      let task = new Task;
      task
        .set('text', text)
        .set('status', 'active')
        .set('acl', this.getAcl());
      if (navigator.onLine) {
        task = await task.save();
      } else {
        task.set('objectId', `local_${Math.random().toString(36).slice(-8)}`);
        this.addQueue('add', task);
      }
      this.task.text = '';
      this.allTasks.push(task);
      this.filter();
    },
    async done(task, event) {
      const checked = event.target.checked;
      task.set('status', checked ? 'done' : 'active');
      const objectId = task.objectId;
      const index = this.allTasks.findIndex(task => task.objectId == objectId);
      this.allTasks[index] = task;
      if (navigator.onLine) {
        await task.update();
      } else {
        this.addQueue('done', task);
      }
      this.filter();
    },
    async destroy(task) {
      const objectId = task.objectId;
      const index = this.allTasks.findIndex(task => task.objectId == objectId);
      this.allTasks.splice(index, 1);
      if (navigator.onLine) {
        await task.delete();
      } else {
        this.addQueue('delete', task);
      }
      this.filter();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
