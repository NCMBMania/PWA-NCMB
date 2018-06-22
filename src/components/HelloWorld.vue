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
      tasks: [],
      task: {
        text: null
      },
      status: 'active'
    }
  },
  async created() {
    if (!ncmb.User.getCurrentUser()) {
      await ncmb.User.loginAsAnonymous();
    }
    await this.fetch();
  },
  methods: {
    async fetch() {
      const tasks = await Task
        .equalTo('status', this.status)
        .fetchAll();
      Vue.set(this, 'tasks', tasks);
    },
    async changeStatus(status) {
      this.status = status;
      this.fetch();
    },
    async add() {
      const text = this.task.text;
      const user = ncmb.User.getCurrentUser();
      const acl = new ncmb.Acl();
      acl
        .setUserReadAccess(user, true)
        .setUserWriteAccess(user, true);
      let task = new Task;
      task = await task
        .set('text', text)
        .set('status', 'active')
        .set('acl', acl)
        .save();
      this.task.text = '';
      await this.fetch();
    },
    async done(task, event) {
      const checked = event.target.checked;
      await task
        .set('status', checked ? 'done' : 'active')
        .update();
      await this.fetch();
    },
    async destroy(task) {
      await task.delete();
      await this.fetch();
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
