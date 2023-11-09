<script>
import { Bar } from "vue-chartjs";

export default {
  extends: Bar,
  props: ["labels", "data"],
  data: () => ({
    chartdata: {
      labels: [],
      datasets: [
        {
          label: "Your Performance",
          backgroundColor: "#5169D5",
          data: [],
          barThickness: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
              max: 100
            }
          }
        ]
      }
    }
  }),
  mounted() {
    this.chartdata = {
      labels: this.labels,
      datasets: this.data
    };
    if (this.data && this.data[0] && !this.data[0].label)
      this.options.legend = { display: false };
    this.renderChart(this.chartdata, this.options);
  },
  watch: {
    data: function(val) {
      this.chartdata = {
        labels: this.labels,
        datasets: this.data
      };
      if (this.data && this.data[0] && !this.data[0].label)
        this.options.legend = { display: false };
      this.renderChart(this.chartdata, this.options);
    }
  }
};
</script>

<style></style>
